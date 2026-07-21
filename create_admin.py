import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('169.58.49.5', username='root', password='Ferrari3377274')

cmd = '''
cd /root/tuy-tantana/django_backend
source venv/bin/activate
python manage.py shell -c "
from accounts.models import User
try:
    User.objects.create_superuser(phone_number='+998000000000', name='Admin', password='Admin123!!!')
    print('SUCCESS')
except Exception as e:
    print('ERROR:', str(e))
"
'''
stdin, stdout, stderr = ssh.exec_command(cmd)
print("STDOUT:", stdout.read().decode())
print("STDERR:", stderr.read().decode())
ssh.close()
