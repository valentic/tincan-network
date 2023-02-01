import click
import sqlalchemy
from flask import current_app
from flask.cli import FlaskGroup, with_appcontext, pass_script_info

from . import create_app, db, socketio

##########################################################################
# Helper functions
##########################################################################

def user_lookup(username):
    return current_app.model.User.query.filter_by(username=username).first()

def role_lookup(name):
    return current_app.model.Role.query.filter_by(name=name).first()

def userrole_lookup(user, role):
    return current_app.model.UserRoles.query.filter_by(user_id=user.id, role_id=role.id).first()

def add_userrole(user, role):

    userrole = userrole_lookup(user, role) 

    if userrole:
        print('  - already in role "%s"' % role.name)
        return

    print('  - added to role "%s"' % role.name)

    args = { 'user_id': user.id, 'role_id': role.id }

    userrole = current_app.model.UserRoles(**args)
    db.session.add(userrole)

    return True

def del_userrole(user, role):

    userrole = userrole_lookup(user, role) 

    if not userrole:
        print('  - not in role "%s"' % role.name)
        return True

    print('  - removed from role "%s"' % role.name)
    db.session.delete(userrole)

    return True

##########################################################################
# Launch functions
##########################################################################

@click.command()
@click.option('-p','--port',default=5000,show_default=True)
@click.option('-r','--root',default='/',show_default=True)
@click.option('-d','--debug',is_flag=True,show_default=True)
def launch(port,root,debug):
    if debug:
        mode = 'development'
    else:
        mode = 'production'
    app = create_app(root=root,mode=mode)
    socketio.run(app,port=port,debug=debug)

##########################################################################
# User functions
##########################################################################

@click.group(cls=FlaskGroup, create_app=create_app)
def cli():
    """
    This is a management script the for Flask appliction.
    """
    # Adds the Flask commands like 'run' and CLI plugin commands
    # like the 'db' group. cli() is the default group, but other
    # groups can be added, like 'user' below.

@cli.group()
def user():
    """
    Perform user administration tasks
    """

@user.command('list')
@pass_script_info
def user_list(info):

    fmt = '%05s %-15s %-25s %-20s %-5s %-6s'
    timefmt = '%Y-%m-%d %H:%M:%S'

    print()
    print(fmt % ('ID','Username','Email','Created','Active','Pending'))
    print( '-'*85)

    table = current_app.model.User

    for user in table.query.order_by(table.id).all():
        created = user.created_on.strftime(timefmt)
        active = 'Yes' if user.active else 'No'
        pending = 'Yes' if user.pending else 'No'
        print(fmt % (user.id,user.username,user.email,created,active,pending))

    print()

@user.command('add')
@click.argument('username')
@click.argument('password')
@click.argument('email')
@click.option('-r','--role','rolename',default='member',help='Add user to role')
def user_add(username,password,email,rolename):

    if user_lookup(username):
        print('User "%s" already exists' % username)
        return

    role = role_lookup(rolename)
    if not role:
        print('Unknown role: %s' % rolename)
        return

    args = {
        'username': username,
        'password': password,
        'email': email,
        'role': role,
        'active': True,
        'pending': False
        }

    user = current_app.model.User(**args)
    db.session.add(user)

    try:
        db.session.commit()
    except sqlalchemy.exc.IntegrityError as exc:
        print('Error:',exc.orig)
        db.session.rollback()
        return

@user.command('del')
@click.argument('username')
def user_del(username):
    user = user_lookup(username)

    if not user:
        print('Unknown user: %s' % username)
        return

    print('Deleting user:  %s' % username)
    db.session.delete(user)
    db.session.commit()

@user.command('mod')
@click.argument('username')
@click.option('-p','--pending/--not-pending',help='Set pending flag',default=None)
@click.option('-a','--active/--not-active',help='Set active flag',default=None)
@click.option('-e','--email')
@click.option('-P','--password')
@click.option('-r','--role','rolename')
def user_mod(username,pending,active,email,password,rolename):
    user = user_lookup(username)

    if not user:
        print('Unknown user: %s' % username)
        return

    print('Modifying user:  %s' % username)

    if email is not None:
        print('  - change email to',email)
        user.email = email

    if active is not None:
        print('  - change active to',active)
        user.active = active

    if pending is not None:
        print('  - change pending to',pending)
        user.pending = pending

    if password is not None:
        print('  - change password')
        user.password = password

    if rolename: 
        role = role_lookup(rolename)

        if not role:
            print('  - unknown role "%s"' % add_role)
            return 

        user.role = role
    
    try:
        db.session.commit()
    except sqlalchemy.exc.IntegrityError as exc:
        print('Error:',exc.orig)
        db.session.rollback()
        return

@user.command('show')
@click.argument('username')
def user_show(username):
    user = user_lookup(username)

    print()
    if not user:
        print('User does not exist')
    else:
        print('ID      :',user.id)
        print('Username:',user.username)
        print('Email   :',user.email)
        print('Active  :',user.active)
        print('Pending :',user.pending)
        print('Created :',user.created_on)
        print('Updated :',user.updated_on)
        print('Role    :',user.role.name)
    print()

##########################################################################
#   Roles 
##########################################################################

@cli.group()
def role():
    """
    Perform role administration tasks
    """

@role.command('list')
@pass_script_info
def role_list(info):

    fmt = '%05s %-15s %s'

    print()
    print(fmt % ('ID','Name','Description'))
    print( '-'*85)

    table = current_app.model.Role

    for role in table.query.order_by(table.id).all():
        print(fmt % (role.id,role.name,role.description))

    print()

@role.command('add')
@click.argument('name')
@click.argument('description')
def role_add(name, description):

    if role_lookup(name):
        print('Role "%s" already exists' % name)
        return

    args = {
        'name': name,
        'description': description
        }

    print(args)

    role = current_app.model.Role(**args)
    db.session.add(role)

    try:
        db.session.commit()
    except sqlalchemy.exc.IntegrityError as exc:
        print('Error:',exc.orig)
        db.session.rollback()
        return

@role.command('del')
@click.argument('name')
def role_del(name):
    role = role_lookup(name)

    if not role:
        print('Unknown role: %s' % name)
        return

    print('Deleting role:  %s' % name)
    db.session.delete(role)
    db.session.commit()

@role.command('mod')
@click.argument('name')
@click.option('-D','--desc')
def role_mod(name, desc):
    role = role_lookup(name)

    if not role:
        print('Unknown role: %s' % name)
        return

    print('Modifying role:  %s' % name)

    if desc is not None:
        print('  - change description to',desc)
        role.description = desc

    db.session.commit()

@role.command('show')
@click.argument('name')
def role_show(name):
    role = role_lookup(name)

    print()
    if not role:
        print('Role does not exist')
    else:
        print('ID         :', role.id)
        print('Name       :', role.name)
        print('Description:', role.description) 
        print('Users      :', ', '.join(user.username for user in role.users)) 

    print()

@cli.command('seed')
def seed():
    """Add default entries to the database"""

    model = current_app.model

    model.update_or_add(dict(id=1,name='member',description="Read only access"), model.Role)
    model.update_or_add(dict(id=2,name='manager',description="Update data"), model.Role)
    model.update_or_add(dict(id=3,name='admin',description="Add/change/delete users"), model.Role)

    db.session.commit()

