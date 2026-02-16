import asyncio
import logging
import sys
import os
import random
from datetime import datetime

# Setup paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.scrapers.hh_scraper import HHScraper
from app.config import settings
from app.config_roles import ROLES, SPECIAL_QUERIES
from scripts.ai_clean_db import run_ai_cleaning_job

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/pipeline.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("Pipeline")

async def execute_full_cycle(deep_scrape: bool = False, dry_run_cleaner: bool = False):
    """
    Executes the full scraping and cleaning cycle.
    
    Args:
        deep_scrape: If True, runs deep scrape (20 pages, cleanup enabled).
                    If False, runs shallow scrape (3 pages, no cleanup).
        dry_run_cleaner: If True, AI cleaner runs in dry-run mode (no deletions).
    
    Returns:
        dict with stats: {
            'scraper_success': bool,
            'cleaner_success': bool,
            'total_time': float,
            'scraper_stats': dict,
            'cleaner_stats': dict
        }
    """
    start_time = datetime.now()
    mode = "DEEP (Daily)" if deep_scrape else "SHALLOW (Hourly)"
    
    logger.info("="*80)
    logger.info(f"🚀 STARTING PIPELINE - Mode: {mode}")
    logger.info("="*80)
    
    stats = {
        'scraper_success': False,
        'cleaner_success': False,
        'total_time': 0,
        'scraper_stats': {'total_added': 0, 'total_updated': 0, 'total_deleted': 0},
        'cleaner_stats': {}
    }
    
    # ========== STEP 1: SCRAPER ==========
    logger.info(f"\n{'='*80}")
    logger.info(f"📥 STEP 1: SCRAPER ({mode})")
    logger.info(f"{'='*80}")
    
    scraper_start = datetime.now()
    scraper = HHScraper()
    
    # Configure scraping parameters based on mode
    if deep_scrape:
        pages = 20
        do_cleanup = True
        special_query_pages = 5
        role_delay = (20, 40)
        query_delay = (5, 10)
    else:
        pages = 3
        do_cleanup = False
        special_query_pages = 1
        role_delay = (10, 20)
        query_delay = (2, 5)
    
    logger.info(f"Configuration: {pages} pages per role, cleanup={do_cleanup}, hh_area={settings.HH_AREA}")
    
    try:
        # Scrape all roles
        roles_list = ROLES.copy()
        random.shuffle(roles_list)
        
        for role in roles_list:
            try:
                logger.info(f"--- Processing: {role['name']} (ID: {role['id']}) ---")
                
                # Polite delay before scraping
                await asyncio.sleep(random.uniform(1, 4))
                
                role_stats = await scraper.fetch_vacancies(
                    role_id=role['id'],
                    text=None,
                    pages=pages,
                    area=settings.HH_AREA,
                    do_cleanup=do_cleanup
                )
                
                # Accumulate stats
                stats['scraper_stats']['total_added'] += role_stats.get('added', 0)
                stats['scraper_stats']['total_updated'] += role_stats.get('updated', 0)
                stats['scraper_stats']['total_deleted'] += role_stats.get('deleted', 0)
                
                logger.info(f"Stats for {role['name']}: +{role_stats.get('added',0)} new, ~{role_stats.get('updated',0)} upd, -{role_stats.get('deleted',0)} del")
                
                # Delay between roles
                delay = random.uniform(*role_delay)
                logger.info(f"Waiting {delay:.1f}s before next role...")
                await asyncio.sleep(delay)
                
            except Exception as e:
                logger.error(f"Failed to scrape role {role['name']}: {e}", exc_info=True)
                continue  # Continue to next role
        
        # Scrape special queries
        logger.info("\n--- Processing Special Queries ---")
        for query in SPECIAL_QUERIES:
            try:
                await asyncio.sleep(random.uniform(1, 3))
                
                query_stats = await scraper.fetch_vacancies(
                    role_id=96,  # Programmer role
                    text=query,
                    pages=special_query_pages,
                    area=settings.HH_AREA,
                    do_cleanup=False
                )
                
                stats['scraper_stats']['total_added'] += query_stats.get('added', 0)
                stats['scraper_stats']['total_updated'] += query_stats.get('updated', 0)
                
                logger.info(f"Stats for '{query}': +{query_stats.get('added',0)} new, ~{query_stats.get('updated',0)} upd")
                
                await asyncio.sleep(random.uniform(*query_delay))
                
            except Exception as e:
                logger.error(f"Failed to scrape query '{query}': {e}", exc_info=True)
                continue
        
        scraper_duration = (datetime.now() - scraper_start).total_seconds()
        logger.info(f"\n✅ SCRAPER COMPLETE in {scraper_duration:.1f}s")
        logger.info(f"Total: +{stats['scraper_stats']['total_added']} new, ~{stats['scraper_stats']['total_updated']} upd, -{stats['scraper_stats']['total_deleted']} del")
        stats['scraper_success'] = True
        
    except Exception as e:
        logger.error(f"❌ SCRAPER FAILED: {e}", exc_info=True)
        stats['scraper_success'] = False
    
    # ========== STEP 2: AI CLEANER ==========
    logger.info(f"\n{'='*80}")
    logger.info(f"🤖 STEP 2: AI CLEANER (dry_run={dry_run_cleaner})")
    logger.info(f"{'='*80}")
    
    cleaner_start = datetime.now()
    
    try:
        await run_ai_cleaning_job(dry_run=dry_run_cleaner)
        
        cleaner_duration = (datetime.now() - cleaner_start).total_seconds()
        logger.info(f"\n✅ AI CLEANER COMPLETE in {cleaner_duration:.1f}s")
        stats['cleaner_success'] = True
        
    except Exception as e:
        logger.error(f"❌ AI CLEANER FAILED: {e}", exc_info=True)
        stats['cleaner_success'] = False
    
    # ========== SUMMARY ==========
    total_duration = (datetime.now() - start_time).total_seconds()
    stats['total_time'] = total_duration
    
    logger.info(f"\n{'='*80}")
    logger.info(f"📊 PIPELINE SUMMARY")
    logger.info(f"{'='*80}")
    logger.info(f"Mode: {mode}")
    logger.info(f"Total Time: {total_duration:.1f}s ({total_duration/60:.1f} minutes)")
    logger.info(f"Scraper: {'✅ SUCCESS' if stats['scraper_success'] else '❌ FAILED'}")
    logger.info(f"AI Cleaner: {'✅ SUCCESS' if stats['cleaner_success'] else '❌ FAILED'}")
    logger.info(f"Scraper Stats: +{stats['scraper_stats']['total_added']} new, ~{stats['scraper_stats']['total_updated']} upd, -{stats['scraper_stats']['total_deleted']} del")
    logger.info(f"{'='*80}\n")
    
    return stats


if __name__ == "__main__":
    # Run with default settings (shallow scrape, AI cleaner in DRY-RUN mode for safety)
    logger.info("Starting manual pipeline execution...")
    logger.info("Mode: Shallow scrape (3 pages), AI cleaner in DRY-RUN mode (safe)")
    logger.info("To run production cleaner, modify dry_run_cleaner=False explicitly.\n")
    
    asyncio.run(execute_full_cycle(deep_scrape=False, dry_run_cleaner=True))
