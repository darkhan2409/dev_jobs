import importlib

run_scheduler = importlib.import_module("scripts.run_scheduler")


def test_trigger_cache_clear_skips_without_internal_secret(monkeypatch):
    called = {"http_post": False}

    def fake_post(*args, **kwargs):
        called["http_post"] = True
        return None

    monkeypatch.setattr(run_scheduler.httpx, "post", fake_post)
    monkeypatch.setattr(
        run_scheduler.os,
        "getenv",
        lambda key, default=None: None if key == "INTERNAL_SECRET" else default,
    )

    run_scheduler.trigger_cache_clear()

    assert called["http_post"] is False
