"""
One-time script to reset is_ai_checked flag for ALL active vacancies.
This forces AI Cleaner to recheck the entire database.

Use this when you want to re-verify all vacancies with the latest AI classifier logic.
"""
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models import Vacancy

def reset_ai_checks():
    """Reset is_ai_checked flag for all active vacancies."""
    db = SessionLocal()
    
    try:
        # Count current state
        total_active = db.query(Vacancy).filter(Vacancy.is_active == True).count()
        already_checked = db.query(Vacancy).filter(
            Vacancy.is_active == True,
            Vacancy.is_ai_checked == True
        ).count()
        
        print(f"📊 Current Database State:")
        print(f"   Total active vacancies: {total_active}")
        print(f"   Already AI checked: {already_checked}")
        print(f"   Not checked: {total_active - already_checked}")
        print()
        
        # Ask for confirmation
        print("⚠️  This will reset is_ai_checked flag for ALL active vacancies.")
        print("   Next AI Cleaner run will recheck everything.")
        print()
        response = input("Continue? (yes/no): ").strip().lower()
        
        if response != 'yes':
            print("❌ Cancelled.")
            return
        
        # Reset all flags
        print("\n🔄 Resetting is_ai_checked flags...")
        affected = db.query(Vacancy).filter(
            Vacancy.is_active == True,
            Vacancy.is_ai_checked == True
        ).update({"is_ai_checked": False}, synchronize_session=False)
        
        db.commit()
        
        print(f"✅ Reset complete!")
        print(f"   {affected} vacancies marked for AI recheck")
        print()
        print("💡 Next steps:")
        print("   1. Run: python scripts/ai_clean_db.py (to see what will be deleted in dry-run)")
        print("   2. Or run: python scripts/run_pipeline.py (full pipeline with AI cleaning)")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_ai_checks()
