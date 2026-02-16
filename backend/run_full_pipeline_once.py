import asyncio
from scripts.run_pipeline import execute_full_cycle

if __name__ == '__main__':
    asyncio.run(execute_full_cycle(deep_scrape=True, dry_run_cleaner=False))
