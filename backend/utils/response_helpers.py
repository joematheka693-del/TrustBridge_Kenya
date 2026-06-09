from flask import jsonify


def success_response(message='Success', data=None, status_code=200):
    payload = {'success': True, 'message': message}
    if data is not None:
        payload['data'] = data
    return jsonify(payload), status_code


def error_response(message='Something went wrong', status_code=400, details=None):
    payload = {'success': False, 'message': message}
    if details is not None:
        payload['details'] = details
    return jsonify(payload), status_code


def phase_response(resource, methods, next_phase):
    return success_response(
        message=f'{resource} route group is registered.',
        data={
            'resource': resource,
            'available_methods': methods,
            'implementation_status': 'foundation-ready',
            'next_phase': next_phase
        }
    )
