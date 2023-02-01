from flask import (
    Blueprint, jsonify, request, current_app,
    render_template, url_for, redirect
    )
from flask_jwt_extended import (
    decode_token,
    create_access_token, create_refresh_token,
    get_jwt_identity, jwt_required
    )
from flask_restful import Api, Resource, reqparse, abort
from flask_mail import Message

from server import model, mail
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import smtplib
from . import history

bp = Blueprint('auth',__name__,url_prefix='/auth',template_folder='templates')
api = Api(bp)

#-- Helper Functions -------------------------------------------------

def send_email(email,subject,text,html):

    msg = Message(subject,recipients=[email])
    msg.body = text
    msg.html = html

    mail.send(msg)


def abort_if_user_exists(username):

    if model.User.query.filter_by(username=username).first():
        abort(409,message='A user with that username already exists')

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
                'refresh_token': refresh_token
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

#-- Account Info -------------------------------------------------

class user_profile(Resource):

    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        user = model.User.query.filter_by(username=current_user).first_or_404()

        return {'username': user.username,
                'email': user.email,
                'role': user.role.name, 
                'userid': user.id
                },200

api.add_resource(user_login,'/login')
api.add_resource(token_refresh,'/refresh')
api.add_resource(user_profile,'/profile')
api.add_resource(create_account,'/signup')
api.add_resource(activate_account,'/activate/<string:token>')
api.add_resource(forgot_password,'/forgot_password')
api.add_resource(reset_password,'/reset_password')
api.add_resource(forgot_username,'/forgot_username')

