from flask import Blueprint, jsonify, request, redirect, current_app, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

from server import pages, model, db
from . import util

import datetime
import requests
import base64

bp = Blueprint('api',__name__,url_prefix='/api')

@bp.route('/echo')
def api_echo():
    return jsonify(dict(
        message='Hello world @ %s' % datetime.datetime.utcnow()
        ))

@bp.route('/page/<path:path>')
def get_page(path):
    page = pages.get_or_404(path)
    return jsonify(dict(content=page))

@bp.route('/sites')
def get_sites():
    sites = [util.convert(row) for row in model.Site.query.all()]
    return jsonify(sites=sites)

@bp.route('/site/<path:sitename>/truth')
def get_truth(sitename):
    
    engine = db.session.get_bind()

    sql = open('server/routes/sql/get_truth.sql').read()
    sql = sql.format(sitename=sitename)
    data = engine.execute(sql).first()[0]

    sql = open('server/routes/sql/get_truth_flights.sql').read()
    sql = sql.format(sitename=sitename)
    flights = engine.execute(sql).first()[0]

    return jsonify(truth=data,flights=flights)

@bp.route('/site/<path:sitename>/radar',methods=['POST'])
def get_radar(sitename):

    data = request.get_json()

    args = {
        'sitename': sitename,
        'start_ts': data['start_ts'],
        'stop_ts':  data['stop_ts'] 
    }

    engine = db.session.get_bind()
    sql = open('server/routes/sql/get_radar.sql').read()
    sql = sql.format(**args)
    results = engine.execute(sql).first()[0]

    return jsonify(radar=results)

@bp.route('/site/<path:sitename>/tracks',methods=['POST'])
def get_tracks(sitename):

    data = request.get_json()

    args = {
        'sitename': sitename,
        'start_ts': data['start_ts'],
        'stop_ts':  data['stop_ts'] 
    }

    engine = db.session.get_bind()
    sql = open('server/routes/sql/get_tracks.sql').read()
    sql = sql.format(**args)
    results = engine.execute(sql).first()[0]

    return jsonify(radar=results)



