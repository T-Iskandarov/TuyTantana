import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from services.models import Service, ServiceImage
import os

def cleanup_orphaned_media():
    print("Starting cleanup of orphaned media files...")
    
    # 1. Barcha fayllarni topish
    media_root = settings.MEDIA_ROOT
    all_files = set()
    for dirpath, _, filenames in os.walk(media_root):
        for f in filenames:
            full_path = os.path.join(dirpath, f)
            all_files.add(os.path.normpath(full_path))
            
    # 2. Baza ichidagi ishlatilayotgan barcha rasm yo'llarini topish
    valid_files = set()
    for image in ServiceImage.objects.all():
        if image.image_path:
            try:
                valid_files.add(os.path.normpath(image.image_path.path))
            except ValueError:
                pass
            except Exception as e:
                print(f"Error reading path for image {image.id}: {e}")
            
    # 3. Solishtirish va "yetim" fayllarni o'chirish
    orphaned_files = all_files - valid_files
    print(f"Total files in media: {len(all_files)}")
    print(f"Valid files in database: {len(valid_files)}")
    print(f"Orphaned files to delete: {len(orphaned_files)}")
    
    for file_path in orphaned_files:
        try:
            os.remove(file_path)
            print(f"Deleted: {file_path}")
        except Exception as e:
            print(f"Error deleting {file_path}: {e}")
            
    print("Cleanup finished successfully!")

if __name__ == '__main__':
    cleanup_orphaned_media()
