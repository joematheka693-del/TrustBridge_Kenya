import re
from decimal import Decimal, InvalidOperation
from flask import request

EMAIL_PATTERN = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


def get_json_payload():
    return request.get_json(silent=True) or {}


def clean_string(value, default='', max_length=None):
    text = str(value if value is not None else default).strip()
    if max_length and len(text) > max_length:
        text = text[:max_length].strip()
    return text


def required_string(payload, field, label=None, max_length=None):
    label = label or field.replace('_', ' ').title()
    value = clean_string(payload.get(field, ''), max_length=max_length)
    if not value:
        return None, f'{label} is required.'
    return value, None


def optional_string(payload, field, default='', max_length=None):
    return clean_string(payload.get(field, default), default=default, max_length=max_length)


def validate_email(value):
    email = clean_string(value).lower()
    if not email or not EMAIL_PATTERN.match(email):
        return None, 'A valid email address is required.'
    return email, None


def validate_choice(value, allowed_values, default=None):
    selected = clean_string(value, default or '')
    return selected if selected in allowed_values else default


def validate_int(value, label='Value', minimum=None, maximum=None):
    try:
        number = int(value)
    except (TypeError, ValueError):
        return None, f'{label} must be a valid number.'

    if minimum is not None and number < minimum:
        return None, f'{label} must be at least {minimum}.'
    if maximum is not None and number > maximum:
        return None, f'{label} cannot exceed {maximum}.'
    return number, None


def validate_decimal(value, label='Value', minimum=None):
    try:
        number = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None, f'{label} must be a valid amount.'

    if minimum is not None and number < Decimal(str(minimum)):
        return None, f'{label} must be at least {minimum}.'
    return number, None


def collect_errors(*items):
    return [error for _, error in items if error]
