import asyncio
import os
import sys
import logging
from datetime import datetime
from tqdm.asyncio import tqdm
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app.models import Vacancy
from app.services.ai_classifier import AIClassifier

# CONFIG
BATCH_SIZE = 20
AUDIT_LOG_FILE = "ai_junk_audit.log"

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger("AIJunkCleaner")

async def run_ai_cleaning_job(dry_run: bool = False):
    """
    Async batch cleaner using AI classifier.
    Only processes vacancies where is_ai_checked = False.
    """
    # Initialize AI Classifier
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("❌ OPENAI_API_KEY not found in environment")
        logger.error("Please add OPENAI_API_KEY to your .env file")
        return
        
    classifier = AIClassifier(api_key=api_key, model=os.getenv("AI_MODEL", "gpt-4o"))
    
    # Database session
    db = SessionLocal()
    
    try:
        # Fetch unchecked vacancies
        unchecked = db.query(Vacancy).filter(
            Vacancy.is_ai_checked == False,
            Vacancy.is_active == True
        ).all()
        
        total = len(unchecked)
        logger.info(f"🔍 Found {total} unchecked vacancies to process")
        
        if total == 0:
            logger.info("✅ All vacancies already checked!")
            return
        
        # Prepare batches
        batches = [unchecked[i:i + BATCH_SIZE] for i in range(0, total, BATCH_SIZE)]
        
        total_junk = 0
        total_deactivated = 0
        
        with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as log_file:
            # Process batches with progress bar
            for batch_num, batch in enumerate(tqdm(batches, desc="Processing"), 1):
                # Prepare vacancy data for AI
                vacancy_data = [
                    {
                        "id": v.id,
                        "title": v.title,
                        "company": v.company_name
                    }
                    for v in batch
                ]
                
                # Classify batch
                junk_ids = await classifier.classify_batch(vacancy_data)
                total_junk += len(junk_ids)

                # Delay between batches to avoid proxy rate limits
                await asyncio.sleep(3)
                
                # Process results
                for vacancy in batch:
                    if vacancy.id in junk_ids:
                        # Log junk
                        msg = f"{datetime.now()} - [DRY_RUN={dry_run}] - JUNK: {vacancy.title} (ID: {vacancy.id})"
                        logger.info(f"🗑️ {vacancy.title}")
                        log_file.write(msg + "\n")
                        
                        if not dry_run:
                            vacancy.is_active = False
                            vacancy.is_ai_checked = True
                            total_deactivated += 1
                    else:
                        # Mark as checked
                        if not dry_run:
                            vacancy.is_ai_checked = True
                
                # GitJob batch
                if not dry_run and batch_num % 5 == 0:
                    db.commit()
                    logger.info(f"--- GitJobted batch {batch_num} ---")
            
            # Final commit
            if not dry_run:
                db.commit()
        
        # Calculate cost estimate
        num_batches = len(batches)
        estimated_cost = num_batches * 0.002  # ~$0.002 per batch
        
        logger.info(f"\n✅ Scan Complete.")
        logger.info(f"Total Scanned: {total}")
        logger.info(f"Junk Found: {total_junk}")
        logger.info(f"Deactivated: {total_deactivated}")
        logger.info(f"Marked as Checked: {total - total_junk}")
        logger.info(f"Estimated Cost: ${estimated_cost:.2f}")
        logger.info(f"Dry Run: {dry_run}")
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_ai_cleaning_job(dry_run=False))
