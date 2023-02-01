from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, verify_jwt_in_request, get_jwt_identity
from flask_restful import Api, Resource, reqparse, fields, marshal_with
from sqlalchemy import inspect, desc

from server import model
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import wraps

import smtplib
from . import history

bp = Blueprint('admin',__name__,url_prefix='/admin')
api = Api(bp)

# https://stackoverflow.com/questions/1958219/convert-sqlalchemy-row-object-to-python-dict
def object_as_dict(obj):
    return {c.key: getattr(obj, c.key)
                for c in inspect(obj).mapper.column_attrs}


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args,**kwargs):
        verify_jwt_in_request()
        username = get_jwt_identity()
        user = model.User.query.filter_by(username=username).first()

        if not user or not user.admin:
            return jsonify({ 'message': 'Unauthorized' }),401

        return fn(*args,**kwargs)
    return wrapper

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'firstname': fields.String,
    'lastname': fields.String,
    'email': fields.String,
    'registered_on': fields.DateTime(dt_format='rfc822'),
    'admin': fields.Boolean,
    'pending': fields.Boolean,
    'active': fields.Boolean,
    }

history_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'action': fields.String,
    'timestamp': fields.DateTime(dt_format='rfc822'),
    }

class ListUsers(Resource):

    @admin_required
    @marshal_with(user_fields, envelope='users')
    def get(self):
        return model.User.query.order_by(model.User.id).all()

class ListHistory(Resource):

    @admin_required
    @marshal_with(history_fields, envelope='history')
    def get(self):
        return model.History.query.order_by(desc(model.History.timestamp)).all()

class ListPending(Resource):

    @admin_required
    @marshal_with(user_fields, envelope='users')
    def get(self):
        return model.User.query.filter_by(pending=True).all()

def SendSignupApprovedEmail(user):

    sender_email = 'no-reply@ingeo.datatransport.org'
    receiver_email = user.email

    body = []
    body.append('InGeO Account Ready')
    body.append('')
    body.append('Your InGeO account is ready to use.')
    body.append('')
    body.append('You can sign in here: https://ingeo.datatransport.org/home/sign-in')
    body.append('')
    body.append('Regards,')
    body.append('The InGeo team.')
    body.append('')
    body.append('If you have any questions, please email us at ingeo-team@ingeo.datatranport.org')
    body.append('')

    body = '\n'.join(body)

    message = MIMEMultipart('alternative')
    message['Subject'] = 'Your InGeO account is ready'
    message['From'] = sender_email
    message['To'] = receiver_email

    message.attach(MIMEText(body,"plain"))

    smtp = smtplib.SMTP('localhost')
    smtp.sendmail(sender_email,receiver_email,message.as_string())
    smtp.quit()

def SendSignupDeniedEmail(user):

    sender_email = 'no-reply@ingeo.datatransport.org'
    receiver_email = user.email

    body = []
    body.append('InGeO Account Denied')
    body.append('')
    body.append('Sorry, we are not able to create an account for you at this time.')
    body.append('')
    body.append('If you have any questions, please email us at ingeo-team@ingeo.datatranport.org')
    body.append('')
    body.append('Regards,')
    body.append('The InGeo team.')
    body.append('')

    body = '\n'.join(body)

    message = MIMEMultipart('alternative')
    message['Subject'] = 'Your InGeO account request has been denied'
    message['From'] = sender_email
    message['To'] = receiver_email

    message.attach(MIMEText(body,"plain"))

    smtp = smtplib.SMTP('localhost')
    smtp.sendmail(sender_email,receiver_email,message.as_string())
    smtp.quit()

    get_jwt_identity()

class ApproveUser(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('username',type=str,required=True)

    @admin_required
    def post(self):

        data = self.parser.parse_args()
        username = data['username']

        user = model.User.query.filter_by(username=username).first()

        if not user:
            return {'message':'Unknown user'},401

        user.pending=False
        user.active=True

        try:
            model.db.session.commit()
        except:
            model.db.session.rollback()

        SendSignupApprovedEmail(user)
        history.add_entry(get_jwt_identity(),'Approved %s' % username)

        return {'message':'approved'},200

class DenyUser(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('username',type=str,required=True)

    @admin_required
    def post(self):

        data = self.parser.parse_args()
        username = data['username']

        user = model.User.query.filter_by(username=username).first()

        if not user:
            return {'message':'Unknown user'},401

        user.pending=False
        user.active=False

        try:
            model.db.session.commit()
        except:
            model.db.session.rollback()

        SendSignupDeniedEmail(user)
        history.add_entry(get_jwt_identity(),'Denied %s' % username)

        return {'message':'denied'},200

api.add_resource(ListUsers,'/users')
api.add_resource(ListHistory,'/history')
api.add_resource(ListPending,'/pending')
api.add_resource(ApproveUser,'/approve')
api.add_resource(DenyUser,'/deny')

