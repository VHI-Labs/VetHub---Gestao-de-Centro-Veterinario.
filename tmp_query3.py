import sqlite3
import json

DB_PATH = r"C:\Users\Admin\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Check schema
cur.execute("PRAGMA table_info(session)")
print("=== session columns ===")
for row in cur.fetchall():
    print(f"  {row['name']} ({row['type']})")

cur.execute("PRAGMA table_info(message)")
print("\n=== message columns ===")
for row in cur.fetchall():
    print(f"  {row['name']} ({row['type']})")

cur.execute("PRAGMA table_info(part)")
print("\n=== part columns ===")
for row in cur.fetchall():
    print(f"  {row['name']} ({row['type']})")

conn.close()
