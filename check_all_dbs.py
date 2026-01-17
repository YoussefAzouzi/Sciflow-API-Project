import sqlite3
import os

db_paths = ['backend/sciflow.db', 'sciflow.db']
for db_path in db_paths:
    if not os.path.exists(db_path):
        print(f"File not found: {db_path}")
        continue
    print(f"\nChecking {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    print("Tables:", tables)
    
    if 'conferences' in tables:
        cursor.execute("SELECT count(*), count(is_external) FROM conferences;")
        count, ext_count = cursor.fetchone()
        print(f"Total: {count}, Internal: {count-ext_count}, External: {ext_count}")
        
        cursor.execute("PRAGMA table_info(conferences);")
        cols = [c[1] for c in cursor.fetchall()]
        print("Columns:", cols)
        
        cursor.execute("SELECT id, name, is_external FROM conferences LIMIT 5;")
        print("Sample:", cursor.fetchall())
    
    conn.close()
