"""Add tunnel type

Revision ID: bf19f533b765
Revises: a95ce91dc3ac
Create Date: 2025-05-07 15:57:36.875880

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bf19f533b765'
down_revision = 'a95ce91dc3ac'
branch_labels = None
depends_on = None


def upgrade(engine_name):
    globals()["upgrade_%s" % engine_name]()


def downgrade(engine_name):
    globals()["downgrade_%s" % engine_name]()





def upgrade_():
    # ### commands auto generated by Alembic - please adjust! ###
    tunnel_table = op.create_table('mesh_tunnel',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    op.bulk_insert(
        tunnel_table,
        [
            {"name": "none", "description": "No tunnel"},
            {"name": "client", "description": "Client originated tunnel"},
            {"name": "server", "description": "Server originated tunnel"},
        ],
    )

    with op.batch_alter_table('mesh_node', schema=None) as batch_op:
        batch_op.add_column(sa.Column('tunnel_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(None, 'mesh_tunnel', ['tunnel_id'], ['id'])

    # Set default tunnel type on existing nodes to client originated

    op.execute("UPDATE mesh_node SET tunnel_id = 2")
    op.alter_column("mesh_node", "tunnel_id", nullable=False)

    # ### end Alembic commands ###


def downgrade_():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('mesh_node', schema=None) as batch_op:
        batch_op.drop_constraint('mesh_node_tunnel_id_fkey', type_='foreignkey')
        batch_op.drop_column('tunnel_id')

    op.drop_table('mesh_tunnel')
    # ### end Alembic commands ###


def upgrade_users():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade_users():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###

