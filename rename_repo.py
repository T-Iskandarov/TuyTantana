import requests
import json
import subprocess
import paramiko

token = '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'
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json'
}

print("Renaming repository on GitHub...")
res = requests.patch('https://api.github.com/repos/T-Iskandarov/TuyTantatana', 
                     headers=headers, 
                     json={'name': 'TuyTantana'})

if res.status_code in [200, 201]:
    print("GitHub repository renamed successfully to TuyTantana!")
else:
    print(f"Failed to rename. Status: {res.status_code}")
    print(res.json())

print("Updating local Git remote...")
subprocess.run(['git', 'remote', 'set-url', 'origin', f'https://{token}@github.com/T-Iskandarov/TuyTantana.git'])
print("Local remote updated.")

print("Updating server Git remote...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('169.58.49.5', username='root', password='Ferrari3377274')
ssh.exec_command(f'cd /root/tuy-tantana && git remote set-url origin https://{token}@github.com/T-Iskandarov/TuyTantana.git')
ssh.close()
print("Server remote updated.")
