"""
Seed RBAC permissions and default roles.
Run with:  python seed_rbac.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from accounts.models import RBACPermission, Role
from accounts.rbac import ALL_PERMISSIONS

# ── 1. Create all permissions ────────────────────────────────
print("Creating permissions...")
perms = {}
for codename, name, category in ALL_PERMISSIONS:
    perm, created = RBACPermission.objects.get_or_create(
        codename=codename,
        defaults={'name': name, 'category': category, 'description': name}
    )
    perms[codename] = perm
    status = "created" if created else "exists"
    print(f"  [{status}] {codename}")

# ── 2. Create default roles ──────────────────────────────────
print("\nCreating roles...")

ROLES = [
    {
        'name': 'Super Admin',
        'description': 'Full access to all admin features',
        'color': '#ef4444',
        'is_system_role': True,
        'permissions': list(perms.keys()),
    },
    {
        'name': 'Order Manager',
        'description': 'Manage orders and view reports',
        'color': '#f59e0b',
        'is_system_role': False,
        'permissions': ['manage_dashboard', 'manage_orders', 'view_reports'],
    },
    {
        'name': 'Product Manager',
        'description': 'Manage products, variants and stock',
        'color': '#10b981',
        'is_system_role': False,
        'permissions': ['manage_dashboard', 'manage_products', 'manage_stock', 'view_reports'],
    },
    {
        'name': 'Staff',
        'description': 'View orders and basic dashboard access',
        'color': '#6366f1',
        'is_system_role': False,
        'permissions': ['manage_dashboard', 'manage_orders', 'view_reports'],
    },
]

for role_data in ROLES:
    perm_keys = role_data.pop('permissions')
    role, created = Role.objects.get_or_create(
        name=role_data['name'],
        defaults={k: v for k, v in role_data.items()}
    )
    role_perms = [perms[k] for k in perm_keys if k in perms]
    role.permissions.set(role_perms)
    status = "created" if created else "updated"
    print(f"  [{status}] {role.name} — {len(role_perms)} permissions")

# ── 3. Assign Super Admin role to superuser ──────────────────
from django.contrib.auth.models import User
from accounts.models import UserRole

superusers = User.objects.filter(is_superuser=True)
if superusers.exists():
    print("\nAssigning Super Admin role to superusers...")
    super_admin_role = Role.objects.get(name='Super Admin')
    for su in superusers:
        ur, created = UserRole.objects.get_or_create(user=su, role=super_admin_role)
        status = "assigned" if created else "already has role"
        print(f"  [{status}] {su.email or su.username}")

print("\n✅ RBAC seeding complete!")
print("\nAPI base URL: http://localhost:8000/admin-panel/")
print("Admin Panel:  http://localhost:3000/admin-panel")
