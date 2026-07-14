import sqlite3
import sys

DB_PATH = r"C:\Users\Admin\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# List tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print("=== TABLES ===")
print(tables)

# Recent sessions for this project
print("\n=== RECENT SESSIONS (HOVET.2) ===")
cur.execute("""
    SELECT id, title, time_created, directory 
    FROM session 
    WHERE directory LIKE '%HOVET.2%' OR directory LIKE '%vethub%' OR directory LIKE '%HOVET%'
    ORDER BY time_created DESC 
    LIMIT 20
""")
for row in cur.fetchall():
    print(f"{row['id']} | {row['time_created']} | {row['title']} | {row['directory']}")

# All sessions
print("\n=== ALL RECENT SESSIONS ===")
cur.execute("""
    SELECT id, title, time_created, directory 
    FROM session 
    ORDER BY time_created DESC 
    LIMIT 30
""")
for row in cur.fetchall():
    print(f"{row['id']} | {row['time_created']} | {row['title']} | {row['directory']}")

conn.close()
