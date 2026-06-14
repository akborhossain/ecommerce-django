from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    attributes_schema = models.JSONField(default=dict, blank=True, help_text="e.g. {'color': 'string', 'size': 'string'}")

    class Meta:
        verbose_name_plural = "Categories"
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k = k.parent
        return ' -> '.join(reversed(full_path))


class Vendor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name


class Product(models.Model):
    _id = models.AutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=200, blank=True, null=True)
    image = models.ImageField(blank=True, null=True)
    brand = models.CharField(max_length=200, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description = models.TextField(null=True, blank=True)
    rating = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True, default=0.0)
    numReviews = models.IntegerField(null=True, blank=True, default=0)
    price = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    countInStock = models.IntegerField(null=True, blank=True, default=0)
    attributes = models.JSONField(default=dict, blank=True, help_text="e.g. {'color': 'Blue', 'ram': '8GB'}")
    createdBy = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['brand']),
        ]

    def __str__(self):
        return self.name or ""


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=200, help_text="e.g., iPhone 15 Blue 128GB")
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    price = models.DecimalField(max_digits=7, decimal_places=2)
    countInStock = models.IntegerField(default=0)
    attributes = models.JSONField(default=dict, blank=True, help_text="e.g., {'color': 'Blue', 'storage': '128GB'}")

    class Meta:
        indexes = [
            models.Index(fields=['sku']),
        ]

    def __str__(self):
        return f"{self.product.name or ''} - {self.name}"


class ProductVariantImage(models.Model):
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(blank=True, null=True)

    def __str__(self):
        return f"Image for {self.variant.sku}"
