
import pytest
import os
from app.interview.storage.career_pipeline_manager import CareerPipelineManager

class TestCareerPipelineManager:

    @pytest.fixture
    def manager(self):
        # Initialize manager - it should pick up the default JSON file
        return CareerPipelineManager()

    def test_load_data(self, manager):
        """Test that data is loaded successfully."""
        assert manager.get_version() is not None
        assert len(manager.get_full_graph()) > 0

    def test_get_next_roles(self, manager):
        """Test retrieving next steps for a role."""
        # frontend_developer has transition to backend_developer
        next_steps = manager.get_next_roles("frontend_developer")
        assert len(next_steps) >= 1

        targets = [step["to"] for step in next_steps]
        assert "backend_developer" in targets

    def test_get_role_cluster(self, manager):
        """Test cluster retrieval (returns None when no clusters in data)."""
        clusters = manager.get_role_clusters()
        if clusters:
            cluster = manager.get_cluster_for_role("backend_developer")
            assert cluster is not None
        else:
            # No clusters in current data version - should return None
            cluster = manager.get_cluster_for_role("backend_developer")
            assert cluster is None

    def test_get_transition_details(self, manager):
        """Test transition details."""
        details = manager.get_transition_details("frontend_developer", "backend_developer")
        assert details is not None
        assert details["difficulty"] == "hard"
        assert "SQL" in details["required_upskill"]

    def test_invalid_role(self, manager):
        """Test behavior with invalid role."""
        next_steps = manager.get_next_roles("non_existent_role")
        assert next_steps == []
