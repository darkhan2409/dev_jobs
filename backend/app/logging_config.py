"""
Logging configuration for the application.
Sets up structured logging with appropriate levels and formatting.
"""
import logging
import sys


def configure_logging() -> None:
    """
    Configure application-wide logging.
    
    - Logs to stdout (production-ready for Docker/K8s)
    - Uses INFO level by default
    - Standard logging format with timestamp, level, logger name, and message
    """
    log_format = "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        datefmt=date_format,
        stream=sys.stdout,
        force=True  # Override any existing configuration
    )
    
    # Set uvicorn loggers to WARNING to reduce noise
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    logger = logging.getLogger(__name__)
    logger.info("Logging configured successfully")
