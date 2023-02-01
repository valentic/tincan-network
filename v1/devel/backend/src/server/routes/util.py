#!/usr/bin/env python

from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify, request, current_app
from flask_restful import abort
from server import model

import datetime
import decimal
import math
import functools

##########################################################################
#   Convert Python types to JSON safe types
##########################################################################

def convert(obj):

    if obj is None:
        return {}

    if isinstance(obj,dict):
        record = obj
    else:
        record = vars(obj)

    record = { k: v for k,v in record.items() if not k.startswith('_') }

    for key,value in record.items():

        if value is None:
            record[key]=''

        if isinstance(value,datetime.datetime):
            record[key]=str(value)

        if isinstance(value,decimal.Decimal):
            record[key]=float(value)

        if isinstance(value,float) and math.isnan(value):
            record[key]=0.0

    return record

##########################################################################
#   Decorator requiring a user to be an admin for access 
##########################################################################

def admin_required(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        username = get_jwt_identity()
        user = model.User.query.filter_by(username=username).first()

        if not user or not user.admin:
            abort(401,message='Unuathorized')

        return fn(*args, **kwargs)
    return wrapper

##########################################################################
#   Decorator requiring a valid API key for access 
##########################################################################

def apikey_required(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        apikey = request.headers.get('MESH-APIKEY')

        if not apikey:
            abort(404,message='Missing API key')

        if current_app.config['API_KEY'] != apikey.strip():
            abort(401,message='Invalid API key')

        return fn(*args, **kwargs)
    return wrapper

