#!/usr/bin/env python3
import os
import pyodbc
import time

def create_database():
    """Create database if it doesn't exist"""
    max_retries = 10
    retry_count = 0

    while retry_count < max_retries:
        try:
            # Connect to master database first
            conn_str = (
                f"DRIVER={{ODBC Driver 18 for SQL Server}};"
                f"SERVER={os.getenv('DB_HOST', 'db')};"
                f"UID={os.getenv('DB_USER', 'sa')};"
                f"PWD={os.getenv('DB_PASSWORD')};"
                f"TrustServerCertificate=yes;"
            )

            print(f"Attempting to connect to SQL Server (attempt {retry_count + 1}/{max_retries})...")
            conn = pyodbc.connect(conn_str)
            conn.autocommit = True
            cursor = conn.cursor()

            # Create database if it doesn't exist
            db_name = os.getenv('DB_NAME', 'barbearia_db')
            cursor.execute(f"IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '{db_name}') CREATE DATABASE {db_name}")

            print(f"Database '{db_name}' created/verified successfully")
            cursor.close()
            conn.close()
            return True

        except Exception as e:
            print(f"Database connection attempt {retry_count + 1} failed: {e}")
            retry_count += 1
            if retry_count < max_retries:
                print(f"Retrying in 5 seconds...")
                time.sleep(5)
            else:
                print("Max retries reached. Database creation failed.")
                return False

    return False

if __name__ == "__main__":
    if create_database():
        print("Database setup completed successfully")
        exit(0)
    else:
        print("Database setup failed")
        exit(1)