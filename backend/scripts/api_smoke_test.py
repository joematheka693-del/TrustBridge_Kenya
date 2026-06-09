"""TrustBridge local API smoke test.

Run this after starting Flask:
    python scripts/api_smoke_test.py

Optional:
    TRUSTBRIDGE_API_BASE=http://127.0.0.1:5000/api python scripts/api_smoke_test.py
"""

import json
import os
import sys
import urllib.error
import urllib.request

API_BASE = os.getenv('TRUSTBRIDGE_API_BASE', 'http://127.0.0.1:5000/api').rstrip('/')

PUBLIC_ENDPOINTS = [
    ('health', 'GET', '/health'),
    ('jobs', 'GET', '/jobs'),
    ('talent', 'GET', '/talent'),
]

ADMIN_EMAIL = os.getenv('TRUSTBRIDGE_ADMIN_EMAIL', 'admin@trustbridge.co.ke')
ADMIN_PASSWORD = os.getenv('TRUSTBRIDGE_ADMIN_PASSWORD', 'Admin@12345')


def request_json(method, path, token=None, payload=None):
    body = None
    headers = {'Accept': 'application/json'}

    if payload is not None:
        body = json.dumps(payload).encode('utf-8')
        headers['Content-Type'] = 'application/json'

    if token:
        headers['Authorization'] = f'Bearer {token}'

    request = urllib.request.Request(f'{API_BASE}{path}', data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            data = response.read().decode('utf-8')
            return response.status, json.loads(data) if data else {}
    except urllib.error.HTTPError as error:
        data = error.read().decode('utf-8')
        try:
            parsed = json.loads(data) if data else {}
        except json.JSONDecodeError:
            parsed = {'message': data}
        return error.code, parsed
    except Exception as error:  # noqa: BLE001 - smoke test should report any local connection issue.
        return 0, {'success': False, 'message': str(error)}


def print_result(name, status, payload):
    ok = 200 <= status < 300 and payload.get('success') is not False
    marker = 'PASS' if ok else 'FAIL'
    message = payload.get('message') or payload.get('error') or 'No message returned.'
    print(f'[{marker}] {name}: HTTP {status} - {message}')
    return ok


def main():
    print(f'TrustBridge API smoke test: {API_BASE}')
    failures = 0

    for name, method, path in PUBLIC_ENDPOINTS:
        status, payload = request_json(method, path)
        if not print_result(name, status, payload):
            failures += 1

    status, payload = request_json('POST', '/login', payload={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD})
    login_ok = print_result('admin login', status, payload)
    if not login_ok:
        failures += 1
    token = payload.get('data', {}).get('token') if isinstance(payload, dict) else None

    if token:
        protected_checks = [
            ('admin overview', 'GET', '/admin/overview'),
            ('system audit', 'GET', '/system-audit'),
            ('trust score events', 'GET', '/trust-score/events'),
        ]
        for name, method, path in protected_checks:
            status, payload = request_json(method, path, token=token)
            if not print_result(name, status, payload):
                failures += 1
    else:
        print('[SKIP] protected admin checks: login did not return a token.')
        failures += 1

    if failures:
        print(f'\nSmoke test finished with {failures} failed check(s).')
        sys.exit(1)

    print('\nSmoke test finished successfully.')


if __name__ == '__main__':
    main()
