"""add analytics_events table

Revision ID: 4f9de89c1a21
Revises: 293830cc19a8
Create Date: 2026-02-14 18:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "4f9de89c1a21"
down_revision: Union[str, Sequence[str], None] = "293830cc19a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "analytics_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("event_name", sa.String(length=120), nullable=False),
        sa.Column("source", sa.String(length=120), server_default="unknown", nullable=False),
        sa.Column("route", sa.String(length=255), server_default="unknown", nullable=False),
        sa.Column("user_type_guess", sa.String(length=32), server_default="unknown", nullable=False),
        sa.Column("session_id", sa.String(length=128), nullable=True),
        sa.Column(
            "payload",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analytics_events_created_at", "analytics_events", ["created_at"], unique=False)
    op.create_index("ix_analytics_events_event_name", "analytics_events", ["event_name"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_analytics_events_event_name", table_name="analytics_events")
    op.drop_index("ix_analytics_events_created_at", table_name="analytics_events")
    op.drop_table("analytics_events")

