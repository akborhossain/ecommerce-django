from rest_framework import serializers
from django.contrib.auth.models import User
from .models import RBACPermission, Role, UserRole, UserDirectPermission


class RBACPermissionSerializer(serializers.ModelSerializer):
    roles_count = serializers.SerializerMethodField()
    direct_users_count = serializers.SerializerMethodField()

    class Meta:
        model = RBACPermission
        fields = ['id', 'name', 'codename', 'description', 'category',
                  'roles_count', 'direct_users_count']

    def get_roles_count(self, obj):
        return obj.roles.count()

    def get_direct_users_count(self, obj):
        return obj.direct_users.count()


class RoleSerializer(serializers.ModelSerializer):
    permissions = RBACPermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=RBACPermission.objects.all(), many=True,
        write_only=True, source='permissions', required=False)
    users_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'color', 'permissions',
                  'permission_ids', 'is_system_role', 'users_count',
                  'created_at', 'updated_at']
        read_only_fields = ['is_system_role', 'created_at', 'updated_at']

    def get_users_count(self, obj):
        return obj.user_roles.count()


class RoleMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'color', 'description']


class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleMinimalSerializer(read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'role', 'assigned_at']


class UserDirectPermissionSerializer(serializers.ModelSerializer):
    permission = RBACPermissionSerializer(read_only=True)

    class Meta:
        model = UserDirectPermission
        fields = ['id', 'permission', 'assigned_at']


class AdminUserSerializer(serializers.ModelSerializer):
    """Full user info used in admin panel."""
    roles = serializers.SerializerMethodField()
    direct_permissions = serializers.SerializerMethodField()
    all_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'is_active', 'is_staff', 'is_superuser',
                  'date_joined', 'last_login',
                  'roles', 'direct_permissions', 'all_permissions']

    def get_roles(self, obj):
        return UserRoleSerializer(obj.user_roles.select_related('role').all(), many=True).data

    def get_direct_permissions(self, obj):
        return UserDirectPermissionSerializer(
            obj.direct_permissions.select_related('permission').all(), many=True).data

    def get_all_permissions(self, obj):
        from .rbac import get_user_permissions
        return get_user_permissions(obj)
