"""drop admin_audit_logs and company.alternate_url

Revision ID: 8d2ef2754f1b
Revises: 4f9de89c1a21
Create Date: 2026-02-16 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8d2ef2754f1b"
down_revision: Union[str, Sequence[str], None] = "4f9de89c1a21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names(schema="public")


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return column_name in {col["name"] for col in inspector.get_columns(table_name, schema="public")}


def _has_index(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    return index_name in {idx["name"] for idx in inspector.get_indexes(table_name, schema="public")}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "companies") and _has_column(inspector, "companies", "alternate_url"):
        op.drop_column("companies", "alternate_url")

    if _has_table(inspector, "admin_audit_logs"):
        for index_name in (
            "ix_admin_audit_logs_target_user_id",
            "ix_admin_audit_logs_admin_user_id",
            "ix_admin_audit_logs_admin_email",
            "ix_admin_audit_logs_action",
        ):
            if _has_index(inspector, "admin_audit_logs", index_name):
                op.drop_index(index_name, table_name="admin_audit_logs")
        op.drop_table("admin_audit_logs")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "companies") and not _has_column(inspector, "companies", "alternate_url"):
        op.add_column("companies", sa.Column("alternate_url", sa.String(), nullable=True))

    if not _has_table(inspector, "admin_audit_logs"):
        op.create_table(
            "admin_audit_logs",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("admin_user_id", sa.Integer(), nullable=False),
            sa.Column("admin_email", sa.String(), nullable=False),
            sa.Column("action", sa.String(), nullable=False),
            sa.Column("target_user_id", sa.Integer(), nullable=True),
            sa.Column("target_email", sa.String(), nullable=True),
            sa.Column("details", sa.Text(), nullable=True),
            sa.Column("ip_address", sa.String(), nullable=False),
            sa.Column("user_agent", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_admin_audit_logs_action", "admin_audit_logs", ["action"], unique=False)
        op.create_index("ix_admin_audit_logs_admin_email", "admin_audit_logs", ["admin_email"], unique=False)
        op.create_index("ix_admin_audit_logs_admin_user_id", "admin_audit_logs", ["admin_user_id"], unique=False)
        op.create_index("ix_admin_audit_logs_target_user_id", "admin_audit_logs", ["target_user_id"], unique=False)
