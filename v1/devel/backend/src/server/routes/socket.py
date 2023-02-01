from flask import current_app, request
from flask_socketio import send, emit, ConnectionRefusedError, join_room, leave_room
from flask_jwt_extended import jwt_required
from server import socketio

@socketio.on('connect')
def handle_connect():
    current_app.logger.info('Client connect')

@socketio.on('join')
def handle_join_room(msg):

    if msg['room']:
        join_room(msg['room'])
        current_app.logger.info('Joined %s' % msg['room'])

@socketio.on('action')
def handle_action(msg):
    current_app.logger.info('*** Action: %s' % msg)

    if msg['type']=='server/weather/subscribe':
        output = {'message': 'Initial weather values'}
        emit('action',{
            'type': 'WEBSOCKET_WEATHER_STARTUP',
            'payload': output
            })

@socketio.on('weather')
@jwt_required()
def handle_weather(data):
    current_app.logger.info('*** Action: %s' % data)

    output = {'message': 'Latest weather values'}

    emit('action',{
        'type':'WEBSOCKET_WEATHER_UPDATE',
        'payload': output
        },
        room='weather')

