"""Pytest configuration — disable embeddings in CI for fast deterministic tests."""

import os

os.environ.setdefault("EMBEDDINGS_ENABLED", "false")
