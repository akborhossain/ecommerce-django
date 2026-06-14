from django.db import models
from django.contrib.auth.models import User


class RBACPermission(models.Model):
    """A named permission representing a specific admin action."""
    name = models.CharField(max_length=200)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default='general', choices=[
        ('orders', 'Orders'),
        ('products', 'Products'),
        ('users', 'Users'),
        ('roles', 'Roles & Permissions'),
        ('reports', 'Reports'),
        ('general', 'General'),
    ])

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} [{self.codename}]"


class Role(models.Model):
    """A named role that bundles multiple permissions."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=20, default='#6366f1',
                             help_text="Hex color for UI display")
    permissions = models.ManyToManyField(
        RBACPermission, blank=True, related_name='roles')
    is_system_role = models.BooleanField(
        default=False, help_text="System roles cannot be deleted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserRole(models.Model):
    """Junction table: a user assigned to a role."""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(
        Role, on_delete=models.CASCADE, related_name='user_roles')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='roles_assigned')

    class Meta:
        unique_together = ('user', 'role')

    def __str__(self):
        return f"{self.user.username} → {self.role.name}"


class UserDirectPermission(models.Model):
    """A permission granted directly to a user (bypassing roles)."""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='direct_permissions')
    permission = models.ForeignKey(
        RBACPermission, on_delete=models.CASCADE, related_name='direct_users')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='permissions_assigned')

    class Meta:
        unique_together = ('user', 'permission')

    def __str__(self):
        return f"{self.user.username} → {self.permission.codename}"
