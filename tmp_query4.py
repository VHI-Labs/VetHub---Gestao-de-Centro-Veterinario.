import sqlite3
import json

DB_PATH = r"C:\Users\Admin\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Real user sessions for HOVET.2
user_sessions = [
    "ses_0a2d4eee6ffeWoOiuXqhYu2X8J",  # Responsividade
    "ses_0a4a5e3f3ffeWv19JsbuI667y1",  # CI/CD
    "ses_0a64263aeffe4K4fQooR23O8eI",  # Migracao
    "ses_0a766c41affeumKVI4pME1UjvT",  # NSI texto
    "ses_113834b71ffeYifk6V90GzsI7F",  # Prontuario build
]

for sid in user_sessions:
    print(f"\n{'='*80}")
    print(f"SESSION: {sid}")
    print(f"{'='*80}")

    # Get session info
    cur.execute("SELECT id, title, directory FROM session WHERE id = ?", (sid,))
    s = cur.fetchone()
    if s:
        print(f"Title: {s['title']}")
        print(f"Directory: {s['directory']}")

    # Get user messages
    cur.execute("""
        SELECT m.id, json_extract(m.data, '$.role') as role, m.time_created,
               (SELECT group_concat(json_extract(p.data, '$.text'), ' ')
                FROM part p WHERE p.message_id = m.id AND json_extract(p.data, '$.type') = 'text') as text_preview
        FROM message m
        WHERE m.session_id = ?
          AND json_extract(m.data, '$.role') = 'user'
        ORDER BY m.time_created
    """, (sid,))

    for row in cur.fetchall():
        text = row['text_preview'] or "(no text)"
        if len(text) > 600:
            text = text[:600] + "..."
        print(f"\n[USER]: {text}")

    # Get assistant tool calls that produced files
    cur.execute("""
        SELECT json_extract(p.data, '$.tool') as tool,
               json_extract(p.data, '$.state.input') as input_data,
               json_extract(p.data, '$.state.output') as output_data
        FROM part p
        JOIN message m ON p.message_id = m.id
        WHERE m.session_id = ?
          AND json_extract(m.data, '$.role') = 'assistant'
          AND json_extract(p.data, '$.type') = 'tool'
          AND json_extract(p.data, '$.tool') IN ('write', 'edit')
        ORDER BY m.time_created, p.time_created
    """, (sid,))

    print("\n[FILE WRITES/EDITS]:")
    for row in cur.fetchall():
        inp = json.loads(row['input_data']) if row['input_data'] else {}
        filepath = inp.get('file_path', inp.get('path', 'unknown'))
        print(f"  {row['tool']}: {filepath}")

conn.close()
