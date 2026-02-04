"""
Aggregation module for IT Career Test Engine.
"""

from .aggregation_engine import (
    AggregationEngine,
    AggregationEngineError,
    IncompleteSessionError,
    RoleScoreResult
)

__all__ = [
    'AggregationEngine',
    'AggregationEngineError',
    'IncompleteSessionError',
    'RoleScoreResult'
]
