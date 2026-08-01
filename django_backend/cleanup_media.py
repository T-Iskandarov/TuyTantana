import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from services.models import ServiceImage

def cleanup_orphaned_media():
    print("Starting orphaned media cleanup...")
    media_root = settings.MEDIA_ROOT
    services_media_dir = os.path.join(media_root, 'services')
    
    if not os.path.exists(services_media_dir):
        print(f"Directory not found: {services_media_dir}")
        return

    # Get all valid image paths from database
    # image_path in DB looks like "services/filename.jpg"
    valid_paths = set(ServiceImage.objects.values_list('image_path', flat=True))
    
    deleted_count = 0
    total_checked = 0
    
    # Iterate through physical files in uploads/services
    for filename in os.listdir(services_media_dir):
        file_path = os.path.join(services_media_dir, filename)
        
        if os.path.isfile(file_path):
            total_checked += 1
            # Reconstruct the path as Django stores it in the DB
            db_path = f"services/{filename}"
            
            if db_path not in valid_paths:
                print(f"Found orphaned file: {db_path} -> Deleting...")
                try:
                    os.remove(file_path)
                    deleted_count += 1
                except Exception as e:
                    print(f"Failed to delete {file_path}: {e}")
                    
    print(f"Cleanup finished! Checked {total_checked} files, deleted {deleted_count} orphaned files.")

if __name__ == '__main__':
    cleanup_orphaned_media()
