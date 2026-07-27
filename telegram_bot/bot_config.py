import os
import sys

# Setup Django Environment so we can import models and use ORM
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DJANGO_DIR = os.path.join(BASE_DIR, 'django_backend')
if DJANGO_DIR not in sys.path:
    sys.path.insert(0, DJANGO_DIR)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

TOKEN = "8878281075:AAHkhBETJ0ZlzEZGIZJZX7w5fL0SW6y93ok"
BOT_USERNAME = "@Tuy_Tantana_bot"
