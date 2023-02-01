from flask import Blueprint, send_from_directory, render_template

bp = Blueprint('main',__name__,url_prefix='/')

#####################################################################
# Catch-all URL - handles browser history
# See flask.pocoo.org/snippets/57

@bp.route('/',defaults={'path':''})
@bp.route('/<path:path>')
def index(path):
    return render_template('index.html')

#####################################################################
# Service worker

@bp.route('/service-worker.js')
def serviceWorker():
    return send_from_directory('templates','service-worker.js')

