import inspect

from app.scrapers.hh_scraper import HHScraper


def test_save_to_db_uses_transaction_context_manager():
    source = inspect.getsource(HHScraper.save_to_db)
    assert "with db.begin()" in source
    assert "db.commit()" not in source
    assert "db.rollback()" not in source
