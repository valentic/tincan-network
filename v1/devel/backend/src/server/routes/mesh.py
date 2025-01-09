from flask import (
    Blueprint, jsonify, request, current_app,
    render_template, url_for, redirect
    )
from flask_jwt_extended import (
    decode_token,
    create_access_token, create_refresh_token,
    get_jwt_identity, jwt_required
    )
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with
from flask_mail import Message

from server import model, mail
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from .util import admin_required, apikey_required

import datetime
import smtplib
import json
import os
import shutil
import click
import shutil
import hashlib

from . import history
from server import db, model

bp = Blueprint('mesh',__name__,url_prefix='/mesh',template_folder='templates')
api = Api(bp)

bp.cli.short_help = 'Perform mesh network tasks'

#-- Command Line Interface -------------------------------------------

def cli_lookup_group(name):
    return model.MeshGroup.query.filter_by(name=name).first()

def cli_lookup_group_id(id):
    return model.MeshGroup.query.filter_by(id=id).first()

def cli_lookup_node(uuid):
    return model.MeshNode.query.filter_by(uuid=uuid).first()

def normalize_name(name):
    name = name.lower()

    # Replace spaces and , with _

    name = name.replace(', ','_')
    name = name.replace(',','_')
    name = name.replace(' ','_')

    return name

@bp.cli.command('list-groups')
def list_groups():

    fmt = '%05s %15s %s'

    click.echo()
    click.echo(fmt % ('ID','Name','Username'))
    click.echo('-'*75)

    for group in model.MeshGroup.query.all():
        click.echo(fmt % (group.id, group.name, group.ssh_user))

    click.echo()

@bp.cli.command('list-nodes')
def list_nodes():

    fmt = '%05s %-10s %-15s %-20s %s'
    timefmt = '%Y-%m-%d %H:%M:%S'

    click.echo()
    click.echo(fmt % ('ID','Group','Name','UUID','Checked on (UTC)'))
    click.echo('-'*75)

    for node in model.MeshNode.query.order_by(model.MeshNode.id).all():
        group = cli_lookup_group_id(id=node.group_id)
        checked_on = node.checked_on.strftime(timefmt) 
        click.echo(fmt % (node.id,group.name,node.name,node.uuid,checked_on))

    click.echo()

@bp.cli.command('list-sshkeys')
@click.argument('name',metavar='Username or group name')
@click.option('--summary/--no-summary',help='Summary only',default=False)
@click.option('--group/--username',help='Lookup by group or username',default=False)
def list_sshkeys(name, summary, group):
   
    if group:
        sshkeys = get_sshkeys_by_group(name)
    else:
        sshkeys = get_sshkeys_by_username(name)

    if summary:
        click.echo()
        click.echo(f'Active SSH keys for {name}: %s' % len(sshkeys))
        click.echo()

    else:

        for public_key in sshkeys:
            print(public_key)

@bp.cli.command('add-group')
@click.argument('group_name')
@click.option('-u','--username',default='',show_default=True)
def add_group(group_name,username):

    if cli_lookup_group(group_name):
        click.echo(f'Group {group_name} already exists')
        return

    args = {
        'name': group_name
        }

    group = model.MeshGroup(**args)
    db.session.add(group)

    try:
        db.session.commit()
    except sqlalchemy.exc.IntegrityError as exc:
        reason = exc.message
        click.echo('Error:',reason)
        db.session.rollback()
        return

    click.echo(f'Added group {group_name}')

@bp.cli.command('del-group')
@click.argument('group_name')
def del_group(group_name):

    group = cli_lookup_group(group_name)

    if not group:
        click.echo(f'Group {group_name} does not exist')
        return 

    db.session.delete(group)
    db.session.commit()

    click.echo(f'Deleted group {group_name}')

@bp.cli.command('mod-group')
@click.argument('group_name')
@click.option('-u','--username')
@click.option('-s','--ssh_host')
@click.option('-p','--ssh_port',type=int)
@click.option('-l','--label')
def mod_group(group_name,username,ssh_host,ssh_port,label):

    group = cli_lookup_group(group_name)

    if not group:
        click.echo(f'Group {group_name} does not exist')
        return 

    click.echo(f'Modifying group {group_name}')

    if username is not None:
        click.echo(f'  - changed username to {username}')
        group.ssh_user = username

    if ssh_host is not None:
        click.echo(f'  - changed SSH host to {ssh_host}')
        group.ssh_host = ssh_host

    if label is not None:
        click.echo(f'  - changed label to {label}')
        group.label = label

    if ssh_port is not None:
        click.echo(f'  - changed SSH port to {ssh_port}')
        group.ssh_port = ssh_port

    db.session.commit()

@bp.cli.command('show-group')
@click.argument('group_name')
def show_group(group_name):

    group = cli_lookup_group(group_name)

    if not group:
        click.echo(f'Group {group_name} does not exist')
        return 

    click.echo()
    click.echo(f'Name:        {group.name}')
    click.echo(f'Label:       {group.label}')
    click.echo(f'SSH user:    {group.ssh_user}')
    click.echo(f'SSH host:    {group.ssh_host}')
    click.echo(f'SSH port:    {group.ssh_port}')
    click.echo()


@bp.cli.command('add-node')
@click.argument('group_name')
@click.argument('uuid')
@click.option('-n','--name',default='',show_default=True)
def add_node(group_name,uuid,name):

    group = cli_lookup_group(group_name) 
    if not group:
        click.echo(f'Group {group_name} does not exist')
        return

    if cli_lookup_node(uuid):
        click.echo(f'Node {uuid} already exists')
        return 

    args = {
        'group_id': group.id,
        'uuid': uuid,
        'name': normalize_name(name)
        }

    node = model.MeshNode(**args)
    db.session.add(node)

    try:
        db.session.commit()
    except sqlalchemy.exc.IntegrityError as exc:
        reason = exc.message
        click.echo('Error:',reason)
        db.session.rollback()
        return

    click.echo(f'Added node {uuid} to {group_name}')

@bp.cli.command('del-node')
@click.argument('uuid')
def del_node(uuid):

    node = cli_lookup_node(uuid)

    if not node:
        click.echo(f'Node {uuid} does not exist')
        return 

    db.session.delete(node)
    db.session.commit()

    click.echo(f'Deleted node {uuid}')

@bp.cli.command('mod-node')
@click.argument('uuid')
@click.option('-a','--active/--not-active',help='Set active flag',default=None)
@click.option('-p','--pending/--not-pending',help='Set pending flag',default=None)
@click.option('-u','--update/--no-update',help='Set update flag',default=None)
@click.option('-n','--name',help='Set node name')
@click.option('-g','--group_name',help='Set group')
@click.option('-x','--longitude',type=float)
@click.option('-y','--latitude',type=float)
@click.option('-r','--replace_uuid',help='Replace UUID')
def mode_node(uuid,active,pending,update,name,group_name,longitude,latitude,replace_uuid):

    node = cli_lookup_node(uuid)

    if not node:
        click.echo(f'Node {uuid} does not exist')
        return 

    click.echo(f'Modifying node {uuid}')

    if active is not None:
        click.echo(f'  - changed active to {active}')
        node.active = active

    if pending is not None:
        click.echo(f'  - changed pending to {pending}')
        node.pending = pending

    if update is not None:
        click.echo(f'  - changed update to {update}')
        node.update = update

    if name is not None:
        name = normalize_name(name)
        click.echo(f'  - changed name to {name}')
        node.name = name

    if latitude is not None:
        click.echo(f'  - changed latitude to {latitude}')
        node.latitude = latitude

    if longitude is not None:
        click.echo(f'  - changed longitude to {longitude}')
        node.longitude = longitude

    if group_name is not None:
        click.echo(f'  - changed group to {group_name}')
        group = cli_lookup_group(group_name)
        if not group:
            click.echo(f'Group {group_name} does not exist')
            return
        node.group_id = group.id

    if replace_uuid is not None:
 
        click.echo(f' - replaced UUID with {replace_uuid}')

        # Check if the new UUID exists, if so delete that entry since 
        # we are going to use the UUID for this node instead. This
        # happens when an existing system has a new OS flashed. The 
        # UUID changes and will register as a pending system on the
        # server. 

        other_node = cli_lookup_node(replace_uuid)

        if other_node:
            db.session.delete(other_node)
            db.session.commit()

        node.uuid = replace_uuid

    db.session.commit()

@bp.cli.command('show-node')
@click.argument('uuid')
def show_node(uuid):

    node = cli_lookup_node(uuid)

    if not node:
        click.echo(f'Node {uuid} does not exist')
        return 

    group = cli_lookup_group_id(node.group_id)

    click.echo()
    click.echo(f'Group:       {group.name}')
    click.echo(f'UUID:        {uuid}')
    click.echo(f'Name:        {node.name}')
    click.echo(f'SSH port:    {node.ssh_port}')
    click.echo(f'SSH alt:     {node.ssh_port_alt}')
    click.echo(f'Latitude:    {node.latitude}')
    click.echo(f'Longitude:   {node.longitude}')
    click.echo(f'Active:      {node.active}')
    click.echo(f'Pending:     {node.pending}')
    click.echo(f'Update:      {node.update}')
    click.echo(f'Created on:  {node.created_on}')
    click.echo(f'Updated on:  {node.updated_on}')
    click.echo(f'Checked on:  {node.checked_on}')
    click.echo()

#-- Helper Functions -------------------------------------------------

def send_email(email,subject,text,html):

    msg = Message(subject,recipients=[email])
    msg.body = text
    msg.html = html

    mail.send(msg)

def abort_if_group_exists(group_name):
    
    if model.MeshGroup.query.filter_by(name=group_name).first():
        abort(409,message='A group with that name already exists')

def abort_if_node_exists(uuid):

    if model.MeshNode.query.filter_by(uuid=uuid).first():
        abort(409,message='A node with that uuid already exists')

def lookup_group(name):
    return model.MeshGroup.query.filter_by(name=name).first_or_404()

def lookup_group_id(id):
    return model.MeshGroup.query.filter_by(id=id).first_or_404()

def lookup_node(uuid):
    return model.MeshNode.query.filter_by(uuid=uuid).first_or_404()

def get_sshkeys_by_group(group_name):

    group = lookup_group(group_name)
    nodes = model.MeshNode.query.filter_by(group_id=group.id,active=True).all()

    return [node.sshkey for node in nodes if node.sshkey]

def get_sshkeys_by_username(username):

    groups = model.MeshGroup.query.filter_by(ssh_user=username).all()

    keys = []

    for group in groups:
        nodes = model.MeshNode.query.filter_by(group_id=group.id,active=True).all()
        keys += [node.sshkey for node in nodes if node.sshkey]

    return keys

#-- Email Handlers -------------------------------------------------

def send_creation_notify(user):

    email = 'signup@ingeo.datatransport.org'
    subject = 'New account created'

    text = render_template('auth/creation_notify.txt',user=user)
    html = render_template('auth/creation_notify.html',user=user)

    send_email(email,subject,text,html)

def send_activation_email(user):

    subject = 'Activate your InGeO account'
    token = current_app.ts.dumps(user.email,salt='activate-key')

    url = url_for('auth.activate_account',token=token,_external=True)

    text = render_template('auth/activate.txt',url=url)
    html = render_template('auth/activate.html',url=url)

    send_email(user.email,subject,text,html)

def send_welcome_email(user):

    subject = 'Your InGeO account is active'

    text = render_template('auth/welcome.txt')
    html = render_template('auth/welcome.html')

    send_email(user.email,subject,text,html)

def send_username_email(user):

    subject = 'InGeO username lookup'

    text = render_template('auth/username.txt',user=user)
    html = render_template('auth/username.html',user=user)

    send_email(user.email,subject,text,html)

def send_password_email(user):

    subject = 'Reset your InGeO password'
    token = current_app.ts.dumps(user.username,salt='password-key')

    #url = url_for('auth.reset_password',token=token,_external=True)
    url = url_for('main.index',_external=True)+'reset/password/'+token

    text = render_template('auth/password.txt',url=url)
    html = render_template('auth/password.html',url=url)

    send_email(user.email,subject,text,html)

#-- Login Handler -------------------------------------------------

class user_login(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('username',type=str,required=True)
    parser.add_argument('password',type=str,required=True)

    def post(self):

        data = self.parser.parse_args()
        username = data['username']

        user = model.User.query.filter_by(username=username).first()

        if user and user.check_password(data['password']) and user.active:
            access_token = create_access_token(identity=username,fresh=True)
            refresh_token = create_refresh_token(username)
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'admin': user.admin
            },200

        return {'message':'Invalid credentials'},401

class token_refresh(Resource):

    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user, fresh=False)
        return { 'access_token': new_token},200


#-- Create Account -------------------------------------------------

class create_account(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('username',type=str,required=True)
    parser.add_argument('email',type=str,required=True)
    parser.add_argument('password',type=str,required=True)
    parser.add_argument('firstname',type=str)
    parser.add_argument('lastname',type=str)
    parser.add_argument('affiliation',type=str)

    def post(self):
        data = self.parser.parse_args()
        username = data['username']

        abort_if_user_exists(username)

        user = model.User(**data)
        model.db.session.add(user)
        model.db.session.commit()

        send_creation_notify(user)
        send_activation_email(user)
        history.add_entry('system','Account created for %s' % username)

        return { 'message': 'Request submitted' },200

class activate_account(Resource):

    def get(self,token):

        try:
            email = current_app.ts.loads(token,salt='activate-key',max_age=86400)
        except:
            abort(404)

        user = model.User.query.filter_by(email=email).first_or_404()

        user.pending = False
        user.active = True

        model.db.session.add(user)
        model.db.session.commit()

        send_welcome_email(user)
        history.add_entry('system','Account activated for %s' % user.username)

        return redirect(url_for('main.index'))

#-- Forgot Password -------------------------------------------------

class forgot_password(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('username',type=str,required=True)

    def post(self):
        data = self.parser.parse_args()
        username = data['username']

        user = model.User.query.filter_by(username=username).first_or_404()

        send_password_email(user)
        history.add_entry('system','Password reset request for %s' % username)

        return { 'message': 'Request submitted' },200

class reset_password(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('password',type=str,required=True)
    parser.add_argument('token',type=str,required=True)

    def post(self):

        data = self.parser.parse_args()
        password = data['password']
        token = data['token']

        try:
            username = current_app.ts.loads(token,salt='password-key',max_age=86400)
        except:
            current_app.logger.info(' decode failed')
            abort(404)

        user = model.User.query.filter_by(username=username).first_or_404()

        user.password = password

        model.db.session.add(user)
        model.db.session.commit()

        history.add_entry('system','Account password reset for %s' % user.username)

        return {'message':'Password changed'},200 

#-- Forgot Username -------------------------------------------------

class forgot_username(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('email',type=str,required=True)

    def post(self):
        data = self.parser.parse_args()
        email = data['email']

        current_app.logger.info('Forgot username: email %s' % email)

        user = model.User.query.filter_by(email=email).first_or_404()

        send_username_email(user)
        history.add_entry('system','Username lookup request for %s' % user.username)

        return { 'message': 'Request submitted' },200

#-- Group Info -------------------------------------------------

group_parser = reqparse.RequestParser()
group_parser.add_argument('name',type=str,required=True)

class GroupList(Resource):

    def get(self): 
        groups = model.MeshGroup.query.all()
        return model.MeshGroup.serialize_list(groups)

    def post(self):
        args = group_parser.parse_args()
        name = args['name']

        abort_if_group_exists(name)
    
        group = model.MeshGroup(**args)
        model.db.session.add(group)
        model.db.session.commit()

        return group.id, 201

class Group(Resource):

    def get(self, group_name):
        group = lookup_group(group_name)
        return group.serialize()

    def delete(self, group_name):
        group = lookup_group(group_name)
        model.db.session.delete(group)
        model.db.session.commit()

        return '', 204
       
    def put(self, group_name):
        args = group_parser.parse_args()
        group = lookup_group(group_name)
        model.update(group, args)

        try:
            model.db.session.commit()
        except:
            abort(404, message=f'Failed to update group {group_name}')

        return self.get(group_name)

#-- Node Info -------------------------------------------------

class NodeList(Resource):

    #parser = reqparse.RequestParser()
    #parser.add_argument('uuid',type=str,required=True)
    #parser.add_argument('sshkey',type=str,required=True)
    #parser.add_argument('group',type=str,required=True)

    # List nodes

    def get(self): 
        nodes = model.MeshNode.query.order_by(model.MeshNode.id).all()
        return json.loads(json.dumps(model.MeshNode.serialize_list(nodes),default=str))

    # Register a new node

    @apikey_required
    def post(self):

        parser = reqparse.RequestParser()
        parser.add_argument('uuid',required=True)
        parser.add_argument('sshkey',required=True)
        parser.add_argument('group',required=True)

        try:
            args = parser.parse_args()
        except Exception as e: 
            current_app.logger.info('exception')
            current_app.logger.info(str(e))
            raise

        group = lookup_group(args['group'])

        data = model.filter_columns(model.MeshNode,args)

        node = cli_lookup_node(args['uuid'])

        if node:
            if node.pending:
                data['updated_on'] = datetime.datetime.utcnow()
                model.update(node,data)
            else:
                abort(409, message='A node with that name is already registered')
        else:
            if data.get('name'):
                data['name'] = normalize_name(name)

            node = model.MeshNode(group_id=group.id,**data)
            model.db.session.add(node)
            model.db.session.commit()

        return node.id, 201

class Node(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('name',type=str)
    parser.add_argument('sshkey',type=str)

    def get(self, uuid):
        node = lookup_node(uuid)
        return json.loads(json.dumps(node.serialize(),default=str))

    def delete(self, uuid):
        node = lookup_node(uuid)
        model.db.session.delete(node)
        model.db.session.commit()
        return '', 204
       
    def patch(self, uuid):
        args = self.parser.parse_args()
        node = lookup_node(uuid)
        args['updated_on'] = datetime.datetime.utcnow()

        current_app.logger.error('PATCHING')
        current_app.logger.error('name: %s' % args['name'])
        current_app.logger.error('sshkey: %s' % args['sshkey'])

        if args['name']:
            node.name = normalize_name(args['name'])

        if args['sshkey']:
            node.sshkey = args['sshkey']
            node.pending = True
            node.active = False

        #model.update(node,args)

        try:
            model.db.session.commit()
        except:
            model.db.session.rollback()
            abort(404, message=f'Failed to update node')

        return self.get(uuid)

class NodeCheckin(Resource):

    parser = reqparse.RequestParser()

    @apikey_required
    def post(self, uuid):
        #args = self.parser.parse_args()
        args = {} 
        node = lookup_node(uuid)
        group = lookup_group_id(node.group_id)
        args['checked_on'] = datetime.datetime.utcnow()
        model.update(node,args)

        try:
            model.db.session.commit()
        except:
            current_app.logger.error('SQL ERROR')
            db.session.rollback()
            raise

        results = {
            'pending':      node.pending
        }

        if not node.pending:

            results.update({
                'active':           node.active,
                'update':           node.update,
                'name':             node.name,
                'ssh_port':         node.ssh_port,
                'ssh_port_alt':     node.ssh_port_alt,
                'ssh_host':         group.ssh_host,
                'ssh_host_port':    group.ssh_port,
                'ssh_user':         group.ssh_user
            })

            if node.sshkey: 
                key_md5 = hashlib.md5(node.sshkey.encode()).hexdigest()
                results.update({
                    'sshkey_md5':   key_md5
                })

            if node.latitude and node.longitude:
                results.update({
                    'latitude':     node.latitude,
                    'longitude':    node.longitude
                })

        return results, 200

class NodeApprove(Resource):

    parser = reqparse.RequestParser()

    @admin_required
    def post(self, uuid):
       
        args = self.parser.parse_args()

        node = lookup_node(uuid)

        args['updated_on'] = datetime.datetime.utcnow()
        args['pending'] = False 
        args['active'] = True

        model.update(node,args)

        return '', 201

class NodeEnable(Resource):

    parser = reqparse.RequestParser()

    @admin_required
    def post(self, uuid):
       
        args = self.parser.parse_args()

        node = lookup_node(uuid)

        args['updated_on'] = datetime.datetime.utcnow()
        args['active'] = True 

        model.update(node,args)

        return '', 201

class NodeDisable(Resource):

    parser = reqparse.RequestParser()

    @admin_required
    def post(self, uuid):
       
        args = self.parser.parse_args()

        node = lookup_node(uuid)

        args['updated_on'] = datetime.datetime.utcnow()
        args['active'] = false 

        model.update(node,args)

        return '', 201


#-- Routes -------------------------------------------------

api.add_resource(GroupList,         '/groups')
api.add_resource(Group,             '/groups/<group_name>')
api.add_resource(NodeList,          '/nodes')
api.add_resource(Node,              '/nodes/<uuid>')
api.add_resource(NodeCheckin,       '/nodes/<uuid>/checkin')
api.add_resource(NodeApprove,       '/nodes/<uuid>/approve')
api.add_resource(NodeEnable,        '/nodes/<uuid>/enable')
api.add_resource(NodeDisable,       '/nodes/<uuid>/disable')

