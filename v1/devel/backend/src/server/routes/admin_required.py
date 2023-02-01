
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        username = get_jwt_identity()
        user = model.User.query.filter_by(username=username).first()

        if not user or not user.admin:
            retutn jsonify({'message': 'Unauthorized'}),401

        return fn(*args, **kwargs)
    return wrapper

