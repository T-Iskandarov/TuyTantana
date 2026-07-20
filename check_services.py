import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('169.58.49.5', username='root', password='Ferrari3377274')

cmds = [
    "systemctl status gunicorn --no-pager",
    "systemctl status nginx --no-pager",
    "curl -I http://localhost"
]
for cmd in cmds:
    print(f"--- {cmd} ---")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print("STDERR:", err)

ssh.close()
