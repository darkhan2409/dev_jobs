
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
        assert len(manager.get_role_clusters()) > 0
        
    def test_get_next_roles(self, manager):
        """Test retrieving next steps for a role."""
        # Test for Data Analyst (should have Data Engineer, PM, ML)
        next_steps = manager.get_next_roles("data_analyst")
        assert len(next_steps) >= 3
        
        targets = [step["to"] for step in next_steps]
        assert "data_engineer" in targets
        assert "product_manager" in targets
        
    def test_get_role_cluster(self, manager):
        """Test cluster retrieval."""
        cluster = manager.get_cluster_for_role("backend_developer")
        assert cluster is not None
        assert cluster["cluster"] == "Ядро разработки"
        assert "backend_developer" in cluster["roles"]
        
    def test_get_transition_details(self, manager):
        """Test transition details."""
        details = manager.get_transition_details("frontend_developer", "fullstack_developer")
        assert details is not None
        assert details["difficulty"] == "medium"
        assert "Backend-языки" in str(details["required_upskill"])

    def test_invalid_role(self, manager):
        """Test behavior with invalid role."""
        next_steps = manager.get_next_roles("non_existent_role")
        assert next_steps == []
