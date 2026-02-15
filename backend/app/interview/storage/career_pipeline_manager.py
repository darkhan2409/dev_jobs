
import json
from typing import List, Dict, Optional, Any
from pathlib import Path

class CareerPipelineManager:
    """
    Manages the IT Career Pipeline graph data.
    Provides methods to query transitions, role clusters, and career paths.
    """
    
    def __init__(self, data_path: Optional[str] = None):
        """
        Initialize the manager with data from the JSON file.
        
        Args:
            data_path: Optional path to the career_pipeline.json file.
                       If None, attempts to find it relative to this file.
        """
        if data_path:
            self.data_file = Path(data_path)
        else:
            # Default location: ../data/career_pipeline.json relative to this file
            current_dir = Path(__file__).parent.parent
            self.data_file = current_dir / "data" / "career_pipeline.json"
            
        self._graph_data: List[Dict] = []
        self._clusters_data: List[Dict] = []
        self._version: str = ""
        self._last_loaded_mtime: Optional[float] = None
        
        self._load_data()
        
    def _load_data(self) -> None:
        """Load data from the JSON file."""
        if not self.data_file.exists():
            # Fallback or empty init if file missing (should not happen in prod)
            print(f"Warning: Career pipeline data file not found at {self.data_file}")
            return
            
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self._version = data.get("version", "unknown")
                self._graph_data = data.get("career_pipeline_graph", [])
                self._clusters_data = data.get("role_clusters", [])
                self._last_loaded_mtime = self.data_file.stat().st_mtime
        except Exception as e:
            print(f"Error loading career pipeline data: {e}")

    def _reload_if_source_changed(self) -> None:
        """
        Reload data when JSON source changes on disk.

        This keeps singleton consumers fresh in long-running API processes.
        """
        if not self.data_file.exists():
            return

        current_mtime = self.data_file.stat().st_mtime
        should_reload = (
            self._last_loaded_mtime is None
            or current_mtime > self._last_loaded_mtime
            or not self._graph_data
        )
        if should_reload:
            self._load_data()
            
    def get_version(self) -> str:
        """Return the data version."""
        self._reload_if_source_changed()
        return self._version
        
    def get_next_roles(self, role_id: str) -> List[Dict[str, Any]]:
        """
        Get a list of possible next career steps for a given role.
        
        Args:
            role_id: The ID of the current role.
            
        Returns:
            List of transition objects containing 'to', 'reason', etc.
        """
        self._reload_if_source_changed()
        transitions = []
        for edge in self._graph_data:
            if edge.get("from") == role_id:
                transitions.append(edge)
        return transitions
        
    def get_transition_details(self, from_role: str, to_role: str) -> Optional[Dict[str, Any]]:
        """
        Get specific details about a transition between two roles.
        
        Args:
            from_role: Source role ID
            to_role: Target role ID
            
        Returns:
            Transition details dict or None if no direct transition exists.
        """
        self._reload_if_source_changed()
        for edge in self._graph_data:
            if edge.get("from") == from_role and edge.get("to") == to_role:
                return edge
        return None
        
    def get_role_clusters(self) -> List[Dict[str, Any]]:
        """Get all role clusters."""
        self._reload_if_source_changed()
        return self._clusters_data
        
    def get_cluster_for_role(self, role_id: str) -> Optional[Dict[str, Any]]:
        """
        Find which cluster a role belongs to.
        
        Args:
            role_id: The role ID to find.
            
        Returns:
            The cluster object or None.
        """
        self._reload_if_source_changed()
        for cluster in self._clusters_data:
            if role_id in cluster.get("roles", []):
                return cluster
        return None
    
    def get_full_graph(self) -> List[Dict[str, Any]]:
        """Return the complete graph data."""
        self._reload_if_source_changed()
        return self._graph_data
