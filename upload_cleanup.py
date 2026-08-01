import paramiko
import os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('169.58.49.5', username='root', password='Ferrari3377274', timeout=10)

# Use SFTP to upload the file
sftp = client.open_sftp()
local_path = r'C:\Users\T_Iskandarov\Desktop\tuy-tantana\django_backend\cleanup_media.py'
remote_path = '/root/tuy-tantana/django_backend/cleanup_media.py'
sftp.put(local_path, remote_path)
sftp.close()
print("Uploaded cleanup_media.py to server.")

def run_cmd(client, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print("STDOUT:", out)
    if err: print("STDERR:", err)
    return out

print("Executing cleanup_media.py on the server...")
run_cmd(client, 'cd /root/tuy-tantana/django_backend && source venv/bin/activate && python cleanup_media.py')

client.close()
print("Cleanup finished!")
