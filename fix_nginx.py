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

# Check current nginx config
out = run_cmd(client, 'grep -r "client_max_body_size" /etc/nginx/')
print("Current config:", out)

# Add client_max_body_size 50M; to http block in nginx.conf if not exists
run_cmd(client, "sed -i '/http {/a \\    client_max_body_size 50M;' /etc/nginx/nginx.conf")

# Check if it was added
out2 = run_cmd(client, 'grep "client_max_body_size" /etc/nginx/nginx.conf')
print("After update:", out2)

run_cmd(client, 'systemctl restart nginx')

client.close()
print("Nginx updated.")
