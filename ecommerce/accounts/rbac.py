"""
RBAC helper functions and DRF permission classes.
"""
from .models import UserRole, UserDirectPermission

# ── Codename constants ──────────────────────────────────────
MANAGE_DASHBOARD   = 'manage_dashboard'
MANAGE_ORDERS      = 'manage_orders'
MANAGE_PRODUCTS    = 'manage_products'
MANAGE_STOCK       = 'manage_stock'
MANAGE_USERS       = 'manage_users'
MANAGE_ROLES       = 'manage_roles'
MANAGE_PERMISSIONS = 'manage_permissions'
VIEW_REPORTS       = 'view_reports'

ALL_PERMISSIONS = [
    (MANAGE_DASHBOARD,   'Access admin dashboard',       'general'),
    (MANAGE_ORDERS,      'View and update orders',       'orders'),
    (MANAGE_PRODUCTS,    'Add, edit, delete products',   'products'),
    (MANAGE_STOCK,       'Update product stock levels',  'products'),
    (MANAGE_USERS,       'View and manage user accounts','users'),
    (MANAGE_ROLES,       'Create and manage roles',      'roles'),
    (MANAGE_PERMISSIONS, 'Create and manage permissions','roles'),
    (VIEW_REPORTS,       'View reports and analytics',   'reports'),
]

# ── Core helper functions ───────────────────────────────────

def user_has_permission(user, codename: str) -> bool:
    """Return True if user has codename via direct grant, role, or superuser."""
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    # Direct permission grant
    if UserDirectPermission.objects.filter(
            user=user, permission__codename=codename).exists():
        return True
    # Role-based permission
    role_ids = UserRole.objects.filter(user=user).values_list('role_id', flat=True)
    if role_ids:
        from .models import Role
        if Role.objects.filter(
                id__in=role_ids, permissions__codename=codename).exists():
            return True
    return False


def get_user_permissions(user) -> list:
    """Return a list of all permission codenames the user holds."""
    if not user or not user.is_authenticated:
        return []
    if user.is_superuser:
        from .models import RBACPermission
        return list(RBACPermission.objects.values_list('codename', flat=True))

    perms = set()
    for dp in UserDirectPermission.objects.filter(user=user).select_related('permission'):
        perms.add(dp.permission.codename)

    role_ids = UserRole.objects.filter(user=user).values_list('role_id', flat=True)
    if role_ids:
        from .models import Role
        for role in Role.objects.filter(id__in=role_ids).prefetch_related('permissions'):
            for p in role.permissions.all():
                perms.add(p.codename)
    return sorted(perms)


def get_user_roles(user) -> list:
    """Return list of role names for the user."""
    return list(UserRole.objects.filter(user=user).select_related('role').values_list('role__name', flat=True))


# ── DRF Permission class factory ────────────────────────────
from rest_framework.permissions import BasePermission


def require_permission(codename: str):
    """
    Factory that returns a DRF BasePermission subclass checking for `codename`.
    Usage:  permission_classes = [IsAuthenticated, require_permission('manage_orders')]
    """
    class _RBACPermission(BasePermission):
        message = f'You do not have permission: {codename}'

        def has_permission(self, request, view):
            return user_has_permission(request.user, codename)

    _RBACPermission.__name__ = f'Perm_{codename}'
    return _RBACPermission
