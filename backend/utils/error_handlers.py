from pymysql.err import IntegrityError, OperationalError, ProgrammingError
from werkzeug.exceptions import BadRequest, Forbidden, MethodNotAllowed, NotFound, Unauthorized
from utils.response_helpers import error_response


def register_error_handlers(app):
    @app.errorhandler(BadRequest)
    def handle_bad_request(error):
        return error_response('The request could not be processed. Check the submitted data.', 400)

    @app.errorhandler(Unauthorized)
    def handle_unauthorized(error):
        return error_response('Authentication is required for this route.', 401)

    @app.errorhandler(Forbidden)
    def handle_forbidden(error):
        return error_response('You do not have permission to perform this action.', 403)

    @app.errorhandler(NotFound)
    def handle_not_found(error):
        return error_response('API route not found.', 404)

    @app.errorhandler(MethodNotAllowed)
    def handle_method_not_allowed(error):
        return error_response('This HTTP method is not allowed for this route.', 405)

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        return error_response('Database constraint failed. Check duplicate or missing linked records.', 409)

    @app.errorhandler(OperationalError)
    def handle_operational_error(error):
        return error_response('Database connection failed. Confirm MySQL is running and the schema has been loaded.', 503)

    @app.errorhandler(ProgrammingError)
    def handle_programming_error(error):
        return error_response('Database query failed. Confirm required tables and columns exist.', 500)

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception(error)
        return error_response('Unexpected server error. Check Flask logs for details.', 500)
