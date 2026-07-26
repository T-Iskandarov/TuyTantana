import os
import zipfile
import paramiko

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        if '__pycache__' in root or 'venv' in root or '.git' in root:
            continue
        for file in files:
            ziph.write(os.path.join(root, file), 
                       os.path.relpath(os.path.join(root, file), 
                                       os.path.join(path, '..')))

print("Zipping django_backend folder...")
zipf = zipfile.ZipFile('django_backend.zip', 'w', zipfile.ZIP_DEFLATED)
zipdir('django_backend', zipf)
zipf.close()
print("Zip created successfully.")

print("Connecting to server...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('169.58.49.5', username='root', password='Ferrari3377274', timeout=15, banner_timeout=30, auth_timeout=15)

print("Uploading to server...")
sftp = ssh.open_sftp()
sftp.put('django_backend.zip', '/root/django_backend.zip')
sftp.close()
print("Upload complete.")

print("Extracting on server...")
stdin, stdout, stderr = ssh.exec_command('unzip -o /root/django_backend.zip -d /root/tuy-tantana')
print(stdout.read().decode())
print("Extraction complete.")

print("Running migrations and restarting gunicorn...")
stdin, stdout, stderr = ssh.exec_command('cd /root/tuy-tantana/django_backend && source ../venv/bin/activate || source venv/bin/activate; python manage.py migrate; systemctl restart gunicorn')
print("STDOUT:", stdout.read().decode())
err = stderr.read().decode()
if err:
    print("STDERR:", err)
print("Restart complete.")

ssh.close()
print("Done!")
