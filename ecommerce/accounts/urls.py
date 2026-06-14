from django.urls import path
from .views import (
    AdminDashboardView,
    AdminOrdersView, AdminOrderTrackingView,
    AdminProductsView, AdminProductStockView,
    AdminUsersView, AdminUserRolesView, AdminUserPermissionsView,
    AdminRolesView, AdminRolePermissionsView,
    AdminPermissionsView,
    MyPermissionsView,
    AdminCategoriesView,
    AdminReturnsView,
)

urlpatterns = [
    # ── Dashboard ──────────────────────────────
    path('dashboard/', AdminDashboardView.as_view()),

    # ── Orders ─────────────────────────────────
    path('orders/', AdminOrdersView.as_view()),
    path('orders/<int:pk>/', AdminOrdersView.as_view()),
    path('orders/<int:pk>/tracking/', AdminOrderTrackingView.as_view()),
    path('returns/', AdminReturnsView.as_view()),
    path('returns/<int:pk>/', AdminReturnsView.as_view()),

    # ── Products ───────────────────────────────
    path('products/', AdminProductsView.as_view()),
    path('products/<int:pk>/', AdminProductsView.as_view()),
    path('products/<int:pk>/stock/', AdminProductStockView.as_view()),

    # ── Categories ─────────────────────────────
    path('categories/', AdminCategoriesView.as_view()),
    path('categories/<int:pk>/', AdminCategoriesView.as_view()),

    # ── Users ──────────────────────────────────
    path('users/', AdminUsersView.as_view()),
    path('users/<int:pk>/', AdminUsersView.as_view()),
    path('users/<int:pk>/roles/', AdminUserRolesView.as_view()),
    path('users/<int:pk>/roles/<int:role_pk>/', AdminUserRolesView.as_view()),
    path('users/<int:pk>/permissions/', AdminUserPermissionsView.as_view()),
    path('users/<int:pk>/permissions/<int:perm_pk>/', AdminUserPermissionsView.as_view()),

    # ── Roles ──────────────────────────────────
    path('roles/', AdminRolesView.as_view()),
    path('roles/<int:pk>/', AdminRolesView.as_view()),
    path('roles/<int:pk>/permissions/', AdminRolePermissionsView.as_view()),
    path('roles/<int:pk>/permissions/<int:perm_pk>/', AdminRolePermissionsView.as_view()),

    # ── Permissions ────────────────────────────
    path('permissions/', AdminPermissionsView.as_view()),
    path('permissions/<int:pk>/', AdminPermissionsView.as_view()),

    # ── Current user info ──────────────────────
    path('me/', MyPermissionsView.as_view()),
]
