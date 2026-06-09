VALID_ROLES = {'member', 'freelancer', 'client', 'admin'}
PUBLIC_SIGNUP_ROLES = {'member', 'freelancer', 'client'}

ROLE_LABELS = {
    'member': 'General Member',
    'freelancer': 'Freelancer',
    'client': 'Client',
    'admin': 'Administrator',
}

ROLE_DASHBOARD_PATHS = {
    'member': '/dashboard/member',
    'freelancer': '/dashboard/freelancer',
    'client': '/dashboard/client',
    'admin': '/admin/dashboard',
}


def normalize_role(role):
    normalized = str(role or 'member').strip().lower()
    return normalized if normalized in VALID_ROLES else 'member'


def is_admin(role):
    return normalize_role(role) == 'admin'


def role_label(role):
    return ROLE_LABELS.get(normalize_role(role), ROLE_LABELS['member'])


def dashboard_path_for_role(role):
    return ROLE_DASHBOARD_PATHS.get(normalize_role(role), ROLE_DASHBOARD_PATHS['member'])
