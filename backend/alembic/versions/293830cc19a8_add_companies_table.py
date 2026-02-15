"""add_companies_table

Revision ID: 293830cc19a8
Revises: 9814638408d9
Create Date: 2026-02-12 15:19:44.621915

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = '293830cc19a8'
down_revision: Union[str, Sequence[str], None] = '9814638408d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create companies table
    op.create_table(
        'companies',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('hh_employer_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('company_type', sa.String(), nullable=True),
        sa.Column('logo_url', sa.String(), nullable=True),
        sa.Column('site_url', sa.String(), nullable=True),
        sa.Column('alternate_url', sa.String(), nullable=True),
        sa.Column('area_id', sa.String(), nullable=True),
        sa.Column('area_name', sa.String(), nullable=True),
        sa.Column('industries', JSONB, nullable=True),
        sa.Column('trusted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('raw_data', JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )

    # Create indexes
    op.create_index('idx_companies_hh_employer_id', 'companies', ['hh_employer_id'], unique=True)
    op.create_index('idx_companies_name', 'companies', ['name'], unique=False)
    op.create_index('idx_companies_area_name', 'companies', ['area_name'], unique=False)

    # Add company_id FK to vacancies (nullable)
    op.add_column('vacancies', sa.Column('company_id', sa.Integer(), nullable=True))
    op.create_index('idx_vacancies_company_id', 'vacancies', ['company_id'], unique=False)
    op.create_foreign_key(
        'fk_vacancies_company_id',
        'vacancies',
        'companies',
        ['company_id'],
        ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop FK and column from vacancies
    op.drop_constraint('fk_vacancies_company_id', 'vacancies', type_='foreignkey')
    op.drop_index('idx_vacancies_company_id', table_name='vacancies')
    op.drop_column('vacancies', 'company_id')

    # Drop companies table
    op.drop_index('idx_companies_area_name', table_name='companies')
    op.drop_index('idx_companies_name', table_name='companies')
    op.drop_index('idx_companies_hh_employer_id', table_name='companies')
    op.drop_table('companies')
