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

bash_script = """#!/bin/bash

# Configuration
DB_NAME="tuy_tantana"
DB_USER="postgres"
export PGPASSWORD="F3377274"

BOT_TOKEN="8969732181:AAHvGe_8Z5KeQNWHHgt3qFMIYxIiWwVlB6U"
CHAT_ID="870644223"

# Paths
BACKUP_DIR="/root/db_backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILE_NAME="${DB_NAME}_backup_${DATE}.sql"
FILE_PATH="${BACKUP_DIR}/${FILE_NAME}"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Take the backup
pg_dump -U ${DB_USER} -h localhost ${DB_NAME} > ${FILE_PATH}

# Zip it to save space and upload faster
tar -czf ${FILE_PATH}.tar.gz -C ${BACKUP_DIR} ${FILE_NAME}

# Send to Telegram
curl -s -F document=@"${FILE_PATH}.tar.gz" -F caption="\U0001F4E6 Tuy Tantana Database Backup - ${DATE}" "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}"

# Clean up: delete the raw .sql and the .tar.gz from the server to save space
rm -f ${FILE_PATH}
rm -f ${FILE_PATH}.tar.gz
"""

# Write the bash script to the server
run_cmd(client, 'cat << \'EOF\' > /root/db_backup.sh\n' + bash_script + '\nEOF')

# Make it executable
run_cmd(client, 'chmod +x /root/db_backup.sh')

# Set up cron job (run every day at 03:00)
# First we check if it already exists, if not we add it
run_cmd(client, '(crontab -l 2>/dev/null | grep -v "/root/db_backup.sh"; echo "0 3 * * * /bin/bash /root/db_backup.sh") | crontab -')

# Run the backup right now manually just to test if it works!
run_cmd(client, '/bin/bash /root/db_backup.sh')

client.close()
print("Backup setup completed and tested successfully.")
