"""add google auth fields to family_members

Revision ID: 60b7cb4d020b
Revises: 25aac297abba
Create Date: 2026-07-26 14:23:51.823105

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '60b7cb4d020b'
down_revision: Union[str, Sequence[str], None] = '25aac297abba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('family_members') as batch_op:
        batch_op.add_column(sa.Column('google_email', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('google_picture', sa.String(), nullable=True))
        batch_op.create_unique_constraint('uq_family_members_google_email', ['google_email'])


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('family_members') as batch_op:
        batch_op.drop_constraint('uq_family_members_google_email', type_='unique')
        batch_op.drop_column('google_picture')
        batch_op.drop_column('google_email')
