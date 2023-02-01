from server import model
from flask import current_app

def add_entry(username,action):
    entry = model.History(username,action)
    model.db.session.add(entry)

    try:
        model.db.session.commit()
        current_app.logger.info('adding history entry')
    except:
        model.db.session.rollback()
        current_app.logger.error('Error adding history entry')

