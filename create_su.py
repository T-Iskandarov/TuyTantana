import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('169.58.49.5', username='root', password='Ferrari3377274')

cmd = """cd /root/tuy-tantana/django_backend && source venv/bin/activate && python manage.py shell -c 'from accounts.models import User; User.objects.filter(phone_number="+998973173497").exists() or User.objects.create_superuser(phone_number="+998973173497", name="Tursunpolat", password="Ferrari3377274")'"""

stdin, stdout, stderr = ssh.exec_command(cmd)
print("STDOUT:", stdout.read().decode())
print("STDERR:", stderr.read().decode())
ssh.close()
