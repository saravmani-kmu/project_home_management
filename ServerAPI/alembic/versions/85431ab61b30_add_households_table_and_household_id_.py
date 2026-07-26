"""add households table and household_id to family_members

Revision ID: 85431ab61b30
Revises: 60b7cb4d020b
Create Date: 2026-07-26 16:00:20.865635

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '85431ab61b30'
down_revision: Union[str, Sequence[str], None] = '60b7cb4d020b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('households',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('family_members') as batch_op:
        batch_op.add_column(sa.Column('household_id', sa.String(), nullable=False))
        batch_op.create_foreign_key(
            'fk_family_members_household_id', 'households', ['household_id'], ['id']
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('family_members') as batch_op:
        batch_op.drop_constraint('fk_family_members_household_id', type_='foreignkey')
        batch_op.drop_column('household_id')
    op.drop_table('households')
