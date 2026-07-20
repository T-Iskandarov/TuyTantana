import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('169.58.49.5', username='root', password='Ferrari3377274')

cmd = "sed -i 's/gunicorn --access-logfile - --workers 3/gunicorn --access-logfile - --workers 3 -m 007/' /etc/systemd/system/gunicorn.service; systemctl daemon-reload; systemctl restart gunicorn; systemctl restart nginx; curl -I http://localhost"

stdin, stdout, stderr = ssh.exec_command(cmd)
print("STDOUT:", stdout.read().decode())
err = stderr.read().decode()
if err:
    print("STDERR:", err)

ssh.close()
