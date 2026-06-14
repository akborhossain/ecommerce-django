import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.contrib.auth.models import User
from product.models import Category, Vendor, Product

def seed_products():
    print("Seeding products from products.js into SQLite database...")
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Superuser created (admin / admin123)")

    # Find or create a default vendor
    vendor = Vendor.objects.first()
    if not vendor:
        vendor = Vendor.objects.create(
            user=admin_user,
            name='Daraz Shop Supplier',
            description='Primary supplier for Daraz Shop tech accessories'
        )

    # Get or create Electronics category
    electronics, _ = Category.objects.get_or_create(
        name='Electronics', 
        defaults={'attributes_schema': {'brand': 'string'}}
    )

    products_data = [
      {
        'name': 'Airpods Wireless Bluetooth Headphones',
        'image': 'airpods.jpg',
        'description': 'Bluetooth technology lets you connect it with compatible devices wirelessly High-quality AAC audio offers immersive listening experience Built-in microphone allows you to take calls while working',
        'brand': 'Apple',
        'price': 89.99,
        'countInStock': 10,
        'rating': 4.5,
        'numReviews': 12,
      },
      {
        'name': 'iPhone 11 Pro 256GB Memory',
        'image': 'phone.jpg',
        'description': 'Introducing the iPhone 11 Pro. A transformative triple-camera system that adds tons of capability without complexity. An unprecedented leap in battery life',
        'brand': 'Apple',
        'price': 599.99,
        'countInStock': 7,
        'rating': 4.0,
        'numReviews': 8,
      },
      {
        'name': 'Cannon EOS 80D DSLR Camera',
        'image': 'camera.jpg',
        'description': 'Characterized by versatile imaging specs, the Canon EOS 80D further clarifies itself using a pair of robust focusing systems and an intuitive design',
        'brand': 'Cannon',
        'price': 929.99,
        'countInStock': 5,
        'rating': 3.0,
        'numReviews': 12,
      },
      {
        'name': 'Sony Playstation 4 Pro White Version',
        'image': 'playstation.jpg',
        'description': 'The ultimate home entertainment center starts with PlayStation. Whether you are into gaming, HD movies, television, music',
        'brand': 'Sony',
        'price': 399.99,
        'countInStock': 11,
        'rating': 5.0,
        'numReviews': 12,
      },
      {
        'name': 'Logitech G-Series Gaming Mouse',
        'image': 'mouse.jpg',
        'description': 'Get a better handle on your games with this Logitech LIGHTSYNC gaming mouse. The six programmable buttons allow customization for a smooth playing experience',
        'brand': 'Logitech',
        'price': 49.99,
        'countInStock': 7,
        'rating': 3.5,
        'numReviews': 10,
      },
      {
        'name': 'Amazon Echo Dot 3rd Generation',
        'image': 'alexa.jpg',
        'description': 'Meet Echo Dot - Our most popular smart speaker with a fabric design. It is our most compact smart speaker that fits perfectly into small space',
        'brand': 'Amazon',
        'price': 29.99,
        'countInStock': 0,
        'rating': 4.0,
        'numReviews': 12,
      },
    ]

    for p_data in products_data:
        prod, created = Product.objects.get_or_create(
            name=p_data['name'],
            defaults={
                'brand': p_data['brand'],
                'category': electronics,
                'vendor': vendor,
                'description': p_data['description'],
                'rating': p_data['rating'],
                'numReviews': p_data['numReviews'],
                'price': p_data['price'],
                'countInStock': p_data['countInStock'],
                'createdBy': admin_user
            }
        )
        if created:
            prod.image = p_data['image']
            prod.save()
            print(f"  [created] {prod.name}")
        else:
            print(f"  [exists]  {prod.name}")

    print("\n✅ Products seeding completed successfully!")

if __name__ == '__main__':
    seed_products()
