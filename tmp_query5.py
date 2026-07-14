import sqlite3
import json

DB_PATH = r"C:\Users\Admin\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Search for user statements containing rule-like keywords
keywords = ['sempre', 'nunca', 'lembr', 'regra', 'decidi', 'decisão', 'tradeoff', 'razão',
            'repeat', 'again', 'every time', 'workflow', 'autonomia', 'esqueça', 'tomale',
            'n precisa', 'n vou']

# Get all user messages from HOVET.2 sessions
user_sessions = [
    "ses_0a2d4eee6ffeWoOiuXqhYu2X8J",
    "ses_0a4a5e3f3ffeWv19JsbuI667y1",
    "ses_0a64263aeffe4K4fQooR23O8eI",
    "ses_0a766c41affeumKVI4pME1UjvT",
    "ses_113834b71ffeYifk6V90GzsI7F",
]

for sid in user_sessions:
    cur.execute("""
        SELECT m.id, json_extract(m.data, '$.role') as role, m.time_created,
               (SELECT group_concat(json_extract(p.data, '$.text'), ' ')
                FROM part p WHERE p.message_id = m.id AND json_extract(p.data, '$.type') = 'text') as text_preview
        FROM message m
        WHERE m.session_id = ?
          AND json_extract(m.data, '$.role') = 'user'
        ORDER BY m.time_created
    """, (sid,))

    session_rules = []
    for row in cur.fetchall():
        text = (row['text_preview'] or "").lower()
        for kw in keywords:
            if kw in text:
                raw = row['text_preview'] or "(no text)"
                session_rules.append((row['id'], kw, raw[:400]))
                break

    if session_rules:
        print(f"\nSession {sid}:")
        for mid, kw, txt in session_rules:
            print(f"  [{kw}]: {txt}")

# Check the CI/CD fix details
print("\n\n=== CI/CD FIX (ses_0a4a5e3f3ffeWv19JsbuI667y1) ===")
cur.execute("""
    SELECT json_extract(p.data, '$.tool') as tool,
           json_extract(p.data, '$.state.input') as input_data
    FROM part p
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = 'ses_0a4a5e3f3ffeWv19JsbuI667y1'
      AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'edit'
    ORDER BY m.time_created, p.time_created
""", )

for row in cur.fetchall():
    inp = json.loads(row['input_data']) if row['input_data'] else {}
    new_str = inp.get('new_string', '')
    if new_str and 'vercel' in new_str.lower():
        print(f"CI/CD edit new_string: {new_str[:500]}")

# Check the plan file content (if readable from trajectory)
print("\n\n=== PLAN FILE (ses_113834b71ffeYifk6V90GzsI7F) ===")
cur.execute("""
    SELECT json_extract(p.data, '$.tool') as tool,
           json_extract(p.data, '$.state.input') as input_data
    FROM part p
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = 'ses_113834b71ffeYifk6V90GzsI7F'
      AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'write'
    ORDER BY m.time_created, p.time_created
""")

for row in cur.fetchall():
    inp = json.loads(row['input_data']) if row['input_data'] else {}
    fp = inp.get('file_path', '')
    content = inp.get('content', '')
    if 'plan' in fp.lower() or '.md' in fp.lower():
        print(f"Plan file: {fp}")
        if content:
            print(f"Content preview: {content[:2000]}")

conn.close()
