"""
Aggregation module for IT Career Test Engine.
"""

from .aggregation_engine import (
    AggregationEngine,
    AggregationEngineError,
    IncompleteSessionError,
    RoleScoreResult
)
from .stage_aggregation_engine import (
    StageAggregationEngine,
    StageAggregationEngineError,
    StageScoreComputeResult
)

__all__ = [
    'AggregationEngine',
    'AggregationEngineError',
    'IncompleteSessionError',
    'RoleScoreResult',
    'StageAggregationEngine',
    'StageAggregationEngineError',
    'StageScoreComputeResult',
]
