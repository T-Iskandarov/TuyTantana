import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('169.58.49.5', username='root', password='Ferrari3377274', timeout=10)

stdin, stdout, stderr = client.exec_command('/bin/bash /root/db_backup.sh')
out = stdout.read().decode()
err = stderr.read().decode()

if out: print("STDOUT:", out)
if err: print("STDERR:", err)

client.close()
print("Test backup triggered.")
