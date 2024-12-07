"""added currency

Revision ID: fad4797bb6ff
Revises: 63a1d0fa1073
Create Date: 2024-11-21 11:49:10.530800

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fad4797bb6ff'
down_revision = '63a1d0fa1073'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('expenses', schema=None) as batch_op:
        batch_op.add_column(sa.Column('currency', sa.String(length=3), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('expenses', schema=None) as batch_op:
        batch_op.drop_column('currency')

    # ### end Alembic commands ###
