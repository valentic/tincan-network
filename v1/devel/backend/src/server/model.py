from flask import current_app
from flask_sqlalchemy import SQLAlchemy

from flask_sqlalchemy.model import BindMetaMixin, Model
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.inspection import inspect
from os import urandom
import string
import uuid

from . import db, bcrypt

# See http://flask-sqlalchemy.pocoo.org/2.3/customizing/
# Disabling Table Name Generation

class NoNameMeta(BindMetaMixin,DeclarativeMeta):
    pass

import jwt
import datetime

#-------------------------------------------------------------------------
# JSON serialization 
#   https://stackoverflow.com/questions/7102754/jsonify-a-sqlalchemy-result-set-in-flask
#-------------------------------------------------------------------------

class Serializer(object):

    def serialize(self):
        return { c: getattr(self, c) for c in inspect(self).attrs.keys()}

    @staticmethod
    def serialize_list(l):
        return [m.serialize() for m in l]

def update_or_add(data, table, primary_keys=None):

    attrs = inspect(table).attrs.keys()
    values = dict((k,v) for k,v in data.items() if k in attrs)

    if not primary_keys:
        primary_keys = [col.name for col in inspect(table).primary_key]

    match = dict((key, values[key]) for key in primary_keys)

    instance = table.query.filter_by(**match).first()

    if instance:
        for k,v in values.items():
            setattr(instance,k,v)
    else:
        instance = table(**values)
        db.session.add(instance)

    try:
        db.session.commit()
    except:
        db.session.rollback()
 
def update(instance, data):

    for k,v in filter_columns(instance, data).items(): 
        setattr(instance,k,v)

    try:
        db.session.commit()
    except:
        db.session.rollback()
 
def filter_columns(obj, data):
    cols = inspect(obj).attrs.keys()
    return dict((k,v) for k,v in data.items() if k in cols)

#-------------------------------------------------------------------------
# Reflected data tables
#-------------------------------------------------------------------------

#class Site(db.Model):
#    __tablename__ = 'sites'
#    __table_args__ = {'autoload':True,'autoload_with':db.engine}

#-------------------------------------------------------------------------
# Mesh tables 
#-------------------------------------------------------------------------

class MeshGroup(db.Model, Serializer):
    """Mesh group"""
    __tablename__ = 'mesh_group'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, unique=True)
    label = db.Column(db.String)
    ssh_user = db.Column(db.String)
    ssh_host = db.Column(db.String)
    ssh_port = db.Column(db.Integer, default=22)

PortSeq = db.Sequence('port_seq', start=2200)

class MeshNode(db.Model, Serializer):
    """Mesh node"""
    __tablename__ = 'mesh_node'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_id = db.Column(db.Integer, db.ForeignKey('mesh_group.id'))
    uuid = db.Column(db.String, unique=True) 
    name = db.Column(db.String,default='')
    label = db.Column(db.String,default='')
    sshkey = db.Column(db.String,default='')

    ssh_port = db.Column(db.Integer, PortSeq,
        server_default=PortSeq.next_value(),
        nullable=False, unique=True
        )

    ssh_port_alt = db.Column(db.Integer, PortSeq,
        server_default=PortSeq.next_value(),
        nullable=False, unique=True
        )

    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    pending = db.Column(db.Boolean,nullable=False,default=True)
    active = db.Column(db.Boolean,nullable=False,default=False)
    update = db.Column(db.Boolean,nullable=False,default=False)

    created_on = db.Column(db.DateTime(timezone=True),
                    nullable=False, default=datetime.datetime.utcnow)

    updated_on = db.Column(db.DateTime(timezone=True),
                    nullable=False, default=datetime.datetime.utcnow)

    checked_on = db.Column(db.DateTime(timezone=True),
                    nullable=False, default=datetime.datetime.utcnow)

#-------------------------------------------------------------------------
# User management tables
#-------------------------------------------------------------------------

class History(db.Model):
    """ History model for storing admin activities"""
    __tablename__ = 'history'
    __bind_key__ = 'users'

    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    username = db.Column(db.String(255),nullable=False)
    timestamp = db.Column(db.DateTime,nullable=False)
    action = db.Column(db.String(255),nullable=False)

    def __init__(self,username,action):
        self.username = username
        self.action = action
        self.timestamp = datetime.datetime.now()

    def __repr__(self):
        return '[%s] <%s> %s' % (self.timestamp,self.username,self.action)

class User(db.Model):
    """ User Model for storing user related details"""
    __tablename__ = 'users'
    __bind_key__ = 'users'

    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    username = db.Column(db.String(255),unique=True,nullable=False)
    password_hash = db.Column(db.String(255),unique=True,nullable=False)
    email = db.Column(db.String(255),unique=True,nullable=False)
    firstname = db.Column(db.String(255),default='')
    lastname = db.Column(db.String(255),default='')
    created_on = db.Column(db.DateTime,nullable=False,default=datetime.datetime.utcnow)
    updated_on = db.Column(db.DateTime,nullable=False,default=datetime.datetime.utcnow)
    pending = db.Column(db.Boolean,nullable=False,default=True)
    active = db.Column(db.Boolean,nullable=False,default=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)

    role = db.relationship('Role', backref='users')

    @hybrid_property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self,plaintext):
        self.password_hash = bcrypt.generate_password_hash(plaintext).decode()

    def check_password(self,password):
        return bcrypt.check_password_hash(self.password,password)

    def modified(self):
        self.last_update = datetime.datetime.utcnow()

    def reset_password(self):

        chars = string.ascii_letters + string.digits
        length = 10

        new_password = "".join(chars[ord(c) % len(chars)] for c in urandom(length))

        self.password = new_password

        return new_password

    def encode_auth_token(self,user_id):
        """
        Generates the Auth Token
        """
        try:
            payload = {
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
                'iat': datetime.datetime.utcnow(),
                'sub': user_id
            }
            return jwt.encode(
                payload,
                current_app.config['SECRET_KEY'],
                algorithm='HS256'
            )
        except Exception as e:
            return e

    @staticmethod
    def decode_auth_token(auth_token):
        """
        Validates the auth token
        :param auth_token
        :return: integer|string
        """
        try:
            payload = jwt.decode(auth_token,current_app.config['SECRET_KEY'])
            is_blacklisted_token = BlacklistToken.check_blacklist(auth_token)
            if is_blacklisted_token:
                return 'Token blacklisted. Please log in again.'
            else:
                return payload['sub']
        except jwt.ExpiredSignatureError:
            return 'Signature expired. Please log in again.'
        except jwt.InvalidTokenError:
            return 'Invalid token. Please log in again.'

    def __repr__(self):
        return '%s <%s>' % (self.username,self.email)

class Role(db.Model):
    """ Model for roles """
    __tablename__ = 'roles'
    __bind_key__ = 'users'
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True)
    description = db.Column(db.String(255))

class BlacklistToken(db.Model):
    __tablename__ = 'blacklist_tokens'
    __bind_key__ = 'users'

    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    token = db.Column(db.String(500),unique=True,nullable=False)
    blacklisted_on = db.Column(db.DateTime,nullable=False)

    def __init__(self):
        self.token = token
        self.blacklisted_on = datetime.datetime.now()

    def __repr__(self):
        return '<id: token: {}'.format(self.token)

    @staticmethod
    def check_blacklist(auth_token):
        res = BlacklistToken.query.filter_by(token=str(auth_token)).first()
        if res:
            return True
        else:
            return False




