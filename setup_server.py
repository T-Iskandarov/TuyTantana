import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('169.58.49.5', username='root', password='Ferrari3377274')

commands = [
    "mkdir -p /root/tuy-tantana/uploads",
    """cat << 'EOF' > /etc/systemd/system/gunicorn.service
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/root/tuy-tantana/django_backend
ExecStart=/root/tuy-tantana/django_backend/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/root/tuy-tantana/django_backend/tuytantana.sock config.wsgi:application

[Install]
WantedBy=multi-user.target
EOF
""",
    "systemctl daemon-reload",
    "systemctl start gunicorn",
    "systemctl enable gunicorn",
    """cat << 'EOF' > /etc/nginx/sites-available/tuytantana
server {
    listen 80;
    server_name api.tuytantana.uz 169.58.49.5;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /root/tuy-tantana/django_backend/staticfiles/;
    }

    location /uploads/ {
        alias /root/tuy-tantana/uploads/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/root/tuy-tantana/django_backend/tuytantana.sock;
    }
}
EOF
""",
    "ln -sf /etc/nginx/sites-available/tuytantana /etc/nginx/sites-enabled",
    "rm -f /etc/nginx/sites-enabled/default",
    "systemctl restart nginx",
]

for cmd in commands:
    print(f"Running: {cmd[:30]}...")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print("STDERR:", err)

ssh.close()
print("All done!")
