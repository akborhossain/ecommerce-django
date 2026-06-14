import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.contrib.auth.models import User
from product.models import Category, Vendor, Product, ProductVariant

def seed_db():
    print("Seeding database...")
    # 1. Create superuser/vendor users if not exist
    admin_user, created = User.objects.get_or_create(username='admin', email='admin@example.com')
    if created:
        admin_user.set_password('admin123')
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print("Superuser created (admin / admin123)")

    vendor_user, created = User.objects.get_or_create(username='vendor1', email='vendor1@example.com')
    if created:
        vendor_user.set_password('vendor123')
        vendor_user.save()
        print("Vendor user created (vendor1 / vendor123)")

    # 2. Create Vendor
    vendor, created = Vendor.objects.get_or_create(
        user=vendor_user, 
        defaults={'name': 'Apex Digital Store', 'description': 'Official supplier of tech gadgets'}
    )
    print(f"Vendor: {vendor.name}")

    # 3. Create Categories Hierarchy
    electronics, _ = Category.objects.get_or_create(
        name='Electronics', 
        defaults={'attributes_schema': {'color': 'string', 'brand': 'string'}}
    )
    audio, _ = Category.objects.get_or_create(
        name='Audio', 
        parent=electronics, 
        defaults={'attributes_schema': {'type': 'string'}}
    )
    earbuds, _ = Category.objects.get_or_create(
        name='Earbuds', 
        parent=audio, 
        defaults={'attributes_schema': {'noise_cancelling': 'string'}}
    )

    fashion, _ = Category.objects.get_or_create(
        name='Fashion', 
        defaults={'attributes_schema': {'gender': 'string'}}
    )
    clothing, _ = Category.objects.get_or_create(
        name='Clothing', 
        parent=fashion, 
        defaults={'attributes_schema': {'material': 'string', 'size': 'string'}}
    )

    print("Categories hierarchy created:")
    print(f" - {electronics}")
    print(f" - {audio}")
    print(f" - {earbuds}")
    print(f" - {fashion}")
    print(f" - {clothing}")

    # Clear existing products to ensure clean seed
    Product.objects.all().delete()

    # 4. Create Product with Variants and Attributes
    p1 = Product.objects.create(
        name='SoundMax Noise Cancelling Earbuds Pro',
        brand='SoundMax',
        category=earbuds,
        vendor=vendor,
        description='Premium wireless active noise cancelling earbuds.',
        rating=4.8,
        numReviews=12,
        price=99.99,
        countInStock=50,
        attributes={'color': 'Black', 'noise_cancelling': 'True', 'brand': 'SoundMax'},
        createdBy=admin_user
    )
    print(f"Product created: {p1.name}")

    # Create Variants for Earbuds
    ProductVariant.objects.create(
        product=p1,
        name='Carbon Black (24h battery)',
        sku='SND-EAR-BLK',
        price=99.99,
        countInStock=30,
        attributes={'color': 'Black', 'noise_cancelling': 'True'}
    )
    ProductVariant.objects.create(
        product=p1,
        name='Pearl White (30h battery)',
        sku='SND-EAR-WHT',
        price=109.99,
        countInStock=20,
        attributes={'color': 'White', 'noise_cancelling': 'True'}
    )

    p2 = Product.objects.create(
        name='ApexFit Sports Smartwatch Active',
        brand='ApexFit',
        category=electronics,
        vendor=vendor,
        description='IP68 waterproof tracking smartwatch.',
        rating=4.5,
        numReviews=8,
        price=149.99,
        countInStock=15,
        attributes={'color': 'Grey', 'brand': 'ApexFit'},
        createdBy=admin_user
    )
    print(f"Product created: {p2.name}")

    p3 = Product.objects.create(
        name='Cotton Polo Casual Shirt',
        brand='Zarra',
        category=clothing,
        vendor=vendor,
        description='Combed cotton lightweight slim polo shirt.',
        rating=4.2,
        numReviews=5,
        price=29.99,
        countInStock=80,
        attributes={'color': 'Blue', 'brand': 'Zarra', 'material': 'Cotton'},
        createdBy=admin_user
    )
    print(f"Product created: {p3.name}")

    ProductVariant.objects.create(
        product=p3,
        name='Navy Blue - Medium',
        sku='ZR-POLO-NAV-M',
        price=29.99,
        countInStock=30,
        attributes={'color': 'Blue', 'size': 'M'}
    )
    ProductVariant.objects.create(
        product=p3,
        name='Navy Blue - Large',
        sku='ZR-POLO-NAV-L',
        price=29.99,
        countInStock=50,
        attributes={'color': 'Blue', 'size': 'L'}
    )

    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed_db()
