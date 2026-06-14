import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from product.models import Product

def fix_product_images():
    print("Fixing image prefixes in database...")
    count = 0
    for p in Product.objects.all():
        if p.image:
            name = p.image.name
            if name.startswith('images/'):
                clean_name = name.replace('images/', '', 1)
                p.image = clean_name
                p.save()
                count += 1
                print(f"  Fixed product '{p.name}': {name} -> {clean_name}")
    print(f"\nDone! Fixed {count} product image paths.")

if __name__ == '__main__':
    fix_product_images()
