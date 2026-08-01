import paramiko

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
MEDIA_DIR="/root/tuy-tantana/uploads"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

DB_FILE_NAME="${DB_NAME}_backup_${DATE}.sql"
DB_FILE_PATH="${BACKUP_DIR}/${DB_FILE_NAME}"

MEDIA_FILE_NAME="tuy_tantana_media_${DATE}.tar.gz"
MEDIA_FILE_PATH="${BACKUP_DIR}/${MEDIA_FILE_NAME}"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# ----------------- 1. DATABASE BACKUP -----------------
pg_dump -U ${DB_USER} -h localhost ${DB_NAME} > ${DB_FILE_PATH}
tar -czf ${DB_FILE_PATH}.tar.gz -C ${BACKUP_DIR} ${DB_FILE_NAME}

# Send DB to Telegram
curl -s -F document=@"${DB_FILE_PATH}.tar.gz" -F caption="\U0001F4E6 Baza Zaxirasi (SQL) - ${DATE}" "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}"

# Clean up DB files
rm -f ${DB_FILE_PATH}
rm -f ${DB_FILE_PATH}.tar.gz


# ----------------- 2. MEDIA (IMAGES) BACKUP -----------------
# Zip the uploads folder
tar -czf ${MEDIA_FILE_PATH} -C /root/tuy-tantana uploads

# Send Media to Telegram
curl -s -F document=@"${MEDIA_FILE_PATH}" -F caption="\U0001F5BC Rasmlar Zaxirasi (Media) - ${DATE}" "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}"

# Clean up Media files
rm -f ${MEDIA_FILE_PATH}
"""

def run_cmd(client, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print("STDOUT:", out)
    if err: print("STDERR:", err)
    return out

run_cmd(client, 'cat << \'EOF\' > /root/db_backup.sh\n' + bash_script + '\nEOF')
run_cmd(client, 'chmod +x /root/db_backup.sh')

# Run immediately for testing
run_cmd(client, '/bin/bash /root/db_backup.sh')

client.close()
print("Backup script updated and tested.")
