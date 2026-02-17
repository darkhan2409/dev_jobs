import os
import sys
import asyncio
import random
import time
import logging
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from scripts.run_pipeline import execute_full_cycle
from scripts.cleanup_auth_artifacts import cleanup_auth_artifacts
import httpx

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/scheduler.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("Scheduler")

def job_hourly_fresh():
    """Runs every hour. Shallow scrape (3 pages) + AI cleaning."""
    logger.info(">>> STARTING HOURLY FRESH JOB <<<")
    
    try:
        asyncio.run(execute_full_cycle(deep_scrape=False, dry_run_cleaner=False))
        logger.info(f"[SUCCESS] HOURLY FRESH JOB FINISHED at {datetime.now().strftime('%H:%M:%S')}. Waiting for next cycle...")
    except Exception as e:
        logger.error(f"[ERROR] HOURLY FRESH JOB FAILED: {e}", exc_info=True)
    
    trigger_cache_clear()

def job_daily_deep():
    """Runs daily at 03:00 AM. Deep scrape (20 pages) + AI cleaning."""
    logger.info(">>> STARTING DAILY DEEP JOB <<<")
    
    try:
        asyncio.run(execute_full_cycle(deep_scrape=True, dry_run_cleaner=False))
        logger.info(f"[SUCCESS] DAILY DEEP JOB FINISHED at {datetime.now().strftime('%H:%M:%S')}. Waiting for next cycle...")
    except Exception as e:
        logger.error(f"[ERROR] DAILY DEEP JOB FAILED: {e}", exc_info=True)
    
    trigger_cache_clear()

def trigger_cache_clear():
    """Calls the API to clear its in-memory cache."""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        secret = os.getenv("INTERNAL_SECRET")
        if not secret:
            logger.warning("[WARNING] INTERNAL_SECRET is not set; skipping cache clear trigger.")
            return
        url = "http://backend:8000/api/internal/clear-cache"
        
        response = httpx.post(
            url,
            timeout=5.0,
            headers={"X-Admin-Secret": secret}
        )
        if response.status_code == 200:
            logger.info(f"[SUCCESS] API Cache cleared successfully.")
        else:
            logger.warning(f"[WARNING] Failed to clear cache: {response.status_code} {response.text}")
    except Exception as e:
        logger.warning(f"[WARNING] Could not connect to API to clear cache (API might be down): {e}")


def job_cleanup_auth_artifacts():
    """Cleanup stale login attempts and old refresh tokens."""
    logger.info(">>> STARTING AUTH ARTIFACT CLEANUP <<<")
    try:
        retention_days = int(os.getenv("AUTH_ARTIFACT_RETENTION_DAYS", "30"))
        result = cleanup_auth_artifacts(retention_days=retention_days)
        logger.info(
            "[SUCCESS] AUTH ARTIFACT CLEANUP FINISHED: login_attempts_deleted=%s refresh_tokens_deleted=%s retention_days=%s",
            result["login_attempts_deleted"],
            result["refresh_tokens_deleted"],
            result["retention_days"],
        )
    except Exception as e:
        logger.error(f"[ERROR] AUTH ARTIFACT CLEANUP FAILED: {e}", exc_info=True)

def heartbeat():
    """Logs 'Alive' status."""
    next_run = datetime.now() + timedelta(minutes=15)
    logger.info(f"[HEARTBEAT] Scheduler Heartbeat. System is alive. Monitoring jobs... (Next heartbeat ~{next_run.strftime('%H:%M')})")

if __name__ == "__main__":
    scheduler = BlockingScheduler()

    # Schedule jobs
    # 1. Heartbeat every 15 minutes
    scheduler.add_job(heartbeat, IntervalTrigger(minutes=15))

    # 2. Hourly Fresh Job
    scheduler.add_job(job_hourly_fresh, IntervalTrigger(hours=1, jitter=120))
    
    # 3. Daily Deep Job at 03:00 AM
    scheduler.add_job(job_daily_deep, CronTrigger(hour=3, minute=0, jitter=300))
    # 4. Daily auth artifact cleanup at 04:00 AM
    scheduler.add_job(job_cleanup_auth_artifacts, CronTrigger(hour=4, minute=0, jitter=180))

    logger.info("Scheduler initialized. Jobs configured.")
    
    # Run hourly job immediately on start
    # logger.info("Triggering immediate hourly fresh job...")
    # try:
    #     job_hourly_fresh()
    # except Exception as e:
    #      logger.error(f"Error during immediate job execution: {e}")


    try:
        logger.info("Starting scheduler loop...")
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped by user.")
