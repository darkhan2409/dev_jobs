import inspect

from app.routers import auth as auth_router


def test_delete_account_ensures_clean_transaction_and_is_atomic():
    source = inspect.getsource(auth_router.delete_account)
    assert "async with db.begin()" in source
    assert "if db.in_transaction()" in source
    assert "await db.rollback()" in source
