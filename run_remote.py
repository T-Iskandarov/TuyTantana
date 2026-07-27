import paramiko

def run_cmd(client, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print("STDOUT:", out)
    if err: print("STDERR:", err)
    return out

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('169.58.49.5', username='root', password='Ferrari3377274', timeout=10)

run_cmd(client, 'cd /root/tuy-tantana && git reset --hard && git clean -fd -e uploads/ -e media/ -e django_backend/uploads/ -e venv/ -e .secret_key -e django_backend/.secret_key -e security.log -e django_backend/security.log -e .env -e django_backend/.env -e *.sqlite3 -e db.sqlite3 -e *.log')
run_cmd(client, 'cd /root/tuy-tantana && git pull origin main')
run_cmd(client, 'cd /root/tuy-tantana/django_backend && source venv/bin/activate && python manage.py makemigrations')
run_cmd(client, 'cd /root/tuy-tantana/django_backend && source venv/bin/activate && python manage.py migrate')
run_cmd(client, 'systemctl restart gunicorn')

client.close()
print("All commands executed.")
