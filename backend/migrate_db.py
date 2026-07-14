import os
import sqlite3

def migrate():
    db_path = r"C:\Users\armut\404\Xiphos\backend\storage\xiphos.sqlite"
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get current columns
    cursor.execute("PRAGMA table_info(trades)")
    columns = [col[1] for col in cursor.fetchall()]
    
    columns_to_add = [
        ("notes", "TEXT"),
        ("ai_explanation", "TEXT"),
        ("mistake_analysis", "TEXT"),
        ("lessons_learned", "TEXT")
    ]
    
    for col_name, col_type in columns_to_add:
        if col_name not in columns:
            print(f"Adding column {col_name} to trades table...")
            cursor.execute(f"ALTER TABLE trades ADD COLUMN {col_name} {col_type} DEFAULT ''")
            
    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
