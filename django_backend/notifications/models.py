from django.db import models
from django.conf import settings

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{getattr(self.user, 'name', '')} ({getattr(self.user, 'phone_number', '')}) - {self.title}"

import threading
import urllib.request
import json
from django.db.models.signals import post_save
from django.dispatch import receiver

TELEGRAM_BOT_TOKEN = "8878281075:AAHkhBETJ0ZlzEZGIZJZX7w5fL0SW6y93ok"

@receiver(post_save, sender=Notification)
def send_telegram_notification(sender, instance, created, **kwargs):
    if created and instance.user and getattr(instance.user, 'telegram_chat_id', None):
        chat_id = instance.user.telegram_chat_id
        title = instance.title
        message = instance.message
        
        def _send():
            try:
                url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
                text = f"🔔 *{title}*\n\n{message}"
                data = json.dumps({
                    'chat_id': chat_id,
                    'text': text,
                    'parse_mode': 'Markdown'
                }).encode('utf-8')
                req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req, timeout=5) as response:
                    pass
            except Exception as e:
                print(f"[Telegram Notification Error]: {e}")
        
        threading.Thread(target=_send, daemon=True).start()
