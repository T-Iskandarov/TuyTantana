import os
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import ServiceImage

@receiver(post_delete, sender=ServiceImage)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `ServiceImage` object is deleted.
    """
    if instance.image_path:
        if os.path.isfile(instance.image_path.path):
            os.remove(instance.image_path.path)
