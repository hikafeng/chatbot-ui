#!/bin/bash

# 数据库连接信息
DB_USER="supabase_admin"                # 数据库用户名
DB_NAME="${POSTGRES_DB:-postgres}" # 数据库名称，默认是 postgres
DB_HOST="localhost"               # 数据库主机
DB_PORT="${POSTGRES_PORT:-5432}"  # 数据库端口，默认是 5432

# SQL 文件目录
MIGRATIONS_DIR="/supabase/migrations"

# 检查目录是否存在
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Error: Migrations directory '$MIGRATIONS_DIR' does not exist."
  exit 1
fi

# 遍历并执行 SQL 文件
for FILE in "$MIGRATIONS_DIR"/*.sql; do
  if [ -f "$FILE" ]; then
    echo "Executing $FILE..."
    psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -f "$FILE"
    if [ $? -ne 0 ]; then
      echo "Error: Failed to execute $FILE. Stopping execution."
      exit 1
    else
      echo "Successfully executed $FILE."
    fi
  else
    echo "No SQL files found in $MIGRATIONS_DIR."
  fi
done

echo "All SQL scripts executed successfully!"