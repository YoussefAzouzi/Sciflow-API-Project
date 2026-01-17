import sqlite3
import os

db_path = 'backend/sciflow.db'
if not os.path.exists(db_path):
    print(f"File not found: {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables:", [t[0] for t in tables])
    
    if ('conferences',) in tables or ('conferences' in [t[0] for t in tables]):
        cursor.execute("SELECT count(*) FROM conferences;")
        print("Conferences count:", cursor.fetchone()[0])
    
    conn.close()
