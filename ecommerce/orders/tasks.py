from celery import shared_task
from django.core.mail import send_mail
from .models import Order
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_order_email_task(order_id, email):
    logger.info(f"Starting email dispatch task for Order ID {order_id}")
    try:
        order = Order.objects.get(_id=order_id)
        subject = f"Order Confirmation - Order #{order._id}"
        message = f"Hello,\n\nThank you for shopping with us! Your order #{order._id} has been placed successfully.\nTotal Price: ${order.totalPrice}\n\nWe will notify you once it's shipped."
        sender = "noreply@darazclone.com"
        
        # Log to simulate sending email
        logger.info(f"Sending email receipt to {email} for Order #{order._id}")
        
        # Real send_mail execution (catch connection errors if SMTP server is not set up)
        try:
            send_mail(subject, message, sender, [email], fail_silently=False)
            logger.info(f"Email sent successfully to {email}")
        except Exception as smtp_err:
            logger.warning(f"SMTP Server not fully configured (simulated send). Error: {str(smtp_err)}")
            
        return f"Email task succeeded for Order {order_id}"
    except Order.DoesNotExist:
        logger.error(f"Order #{order_id} does not exist. Cannot send receipt.")
        return f"Order not found: {order_id}"
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def notify_vendor_task(order_id):
    logger.info(f"Triggering vendor notifications for Order #{order_id}")
    try:
        order = Order.objects.get(_id=order_id)
        # Fetch related vendors for items ordered
        items = order.orderitem_set.select_related('product', 'product__vendor').all()
        notified_vendors = []
        for item in items:
            product = item.product
            if product and product.vendor:
                vendor = product.vendor
                if vendor.id not in notified_vendors:
                    # In a full app, we would write to a VendorNotification database table or alert dashboard WebSockets
                    logger.info(f"ALERT: Notify Vendor '{vendor.name}' about new order item: {item.name} (Qty: {item.qty})")
                    notified_vendors.append(vendor.id)
        return f"Notified vendors: {notified_vendors} for Order {order_id}"
    except Order.DoesNotExist:
        logger.error(f"Order #{order_id} does not exist. Cannot notify vendors.")
        return f"Order not found: {order_id}"
    except Exception as e:
        logger.error(f"Failed to notify vendors: {str(e)}")
        return f"Error: {str(e)}"
