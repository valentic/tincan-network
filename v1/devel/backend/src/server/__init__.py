from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_compress import Compress
from flask_socketio import SocketIO
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from flask_flatpages import FlatPages 
from werkzeug.middleware.proxy_fix import ProxyFix
from itsdangerous import URLSafeTimedSerializer
from docutils.core import publish_parts
from flask.wrappers import Request

import os
import json
import uuid
import logging
import decimal
import datetime

logging.basicConfig(level=logging.INFO)
logging.getLogger('sqlalchemy.engine.base').setLevel(logging.WARN)

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
compress = Compress()
socketio = SocketIO()
jwt = JWTManager()
mail = Mail()
pages = FlatPages()

#-- Helper classes ----------------------------------------------------


class ReverseProxy(object):
    def __init__(self, app):
        self.app = app.wsgi_app
        self.config = app.config

    def __call__(self, environ, start_response):

        if self.config['ROOT_PATH']:
            script_name = self.config['ROOT_PATH']
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]

        return self.app(environ,start_response)

class Encoder(json.JSONEncoder):
    def default(self,o):
        if isinstance(o,decimal.Decimal):
            return float(o)
        elif isinstance(o,datetime.datetime):
            #return o.isoformat()
            return int(o.strftime('%s'))
        return super(Encoder,self).default(o)

def rst_renderer(text):
    parts = publish_parts(source=text, writer_name='html')
    return parts['html_body']

# Fix for bug: werkzeug now raises error if data not in json
# but flask-restful defaults to trying json first
# https://github.com/pallets/flask/issues/4552

class AnyJsonRequest(Request):

    def on_json_loading_failed(self, e):
        if e is not None:
            return super().on_json_loading_failed(e)

#-- Application------------------------------------------------------

def create_app():

    # Create and configure the app

    mode = os.getenv('FLASK_MODE','production')
    root = os.getenv('FLASK_ROOT','/')

    app = Flask(__name__,instance_relative_config=True)

    app.config.from_object('server.config.%s' % mode.capitalize())
    app.wsgi_app = ReverseProxy(app)
    app.json_encoder = Encoder
    app.request_class = AnyJsonRequest

    logging.info('ROOT=%s' % root)
    logging.info('MODE=%s' % mode)
    logging.info('DEBUG=%s' % app.debug)

    # Ensure the instance folder exists

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    secret_key = os.path.join(app.instance_path,'secret.key')
    api_key = os.path.join(app.instance_path,'api.key')

    if not os.path.exists(secret_key):
        open(secret_key,'w').write(uuid.uuid4().hex)

    if not os.path.exists(api_key):
        open(api_key,'w').write(uuid.uuid4().hex)

    app.config['SECRET_KEY'] = open(secret_key).read().strip()
    app.config['API_KEY'] = open(api_key).read().strip()
    app.config['MODE'] = mode
    app.config['ROOT_PATH'] = root
    app.config['FLATPAGES_HTML_RENDERER'] = rst_renderer

    db.app = app
    db.init_app(app)
    migrate.init_app(app,db)
    bcrypt.init_app(app)
    compress.init_app(app)
    mail.init_app(app)
    socketio.init_app(app,path=root+'/api/socket.io')
    jwt.init_app(app)
    pages.init_app(app)
    ProxyFix(app)

    app.ts = URLSafeTimedSerializer(app.config["SECRET_KEY"])

    # import model here so reflected tables get built (needs the db engine)
    # https://stackoverflow.com/questions/36337416/reflecting-tables-with-flask-sqlalchemy-raises-runtimeerror-application-not-reg

    from . import model
    app.model = model

    load_blueprints(app)

    return app

def load_blueprints(app):

    from .routes import main
    from .routes import api
    from .routes import auth
    from .routes import admin
    from .routes import socket
    from .routes import mesh

    app.register_blueprint(main.bp)
    app.register_blueprint(api.bp)
    app.register_blueprint(auth.bp,url_prefix='/api/auth')
    app.register_blueprint(admin.bp,url_prefix='/api/admin')
    app.register_blueprint(mesh.bp,url_prefix='/api/mesh')

