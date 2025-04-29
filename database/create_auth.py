import os
import mysql.connector
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get MySQL credentials from environment variables
db_host = os.getenv('DB_HOST')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')

# Connect to MySQL server
conn = mysql.connector.connect(
    host=db_host,
    user=db_user,
    password=db_password
)

cursor = conn.cursor()

# Create database if not exists
cursor.execute("CREATE DATABASE IF NOT EXISTS auth_db")
cursor.execute("USE auth_db")

# Create users table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hash_passwd TEXT NOT NULL,
    f_name VARCHAR(50),
    l_name VARCHAR(50),
    profile_path TEXT
)
""")

# Commit changes and close connection
conn.commit()
cursor.close()
conn.close()

print("Database and table created successfully.")

