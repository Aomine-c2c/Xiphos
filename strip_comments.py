import os
import tokenize

def remove_comments(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        source = f.read()

    with open(filename, 'rb') as f:
        tokens = list(tokenize.tokenize(f.readline))
    
    with open(filename, 'w', encoding='utf-8') as f:
        last_lineno = 1
        last_col = 0
        for tok in tokens:
            token_type = tok.type
            token_string = tok.string
            start_line, start_col = tok.start
            end_line, end_col = tok.end

            if start_line > last_lineno:
                last_col = 0
            if start_col > last_col:
                f.write(' ' * (start_col - last_col))

            if token_type == tokenize.COMMENT:
                # keep noqa comments and type comments
                if 'noqa' in token_string.lower() or 'type:' in token_string.lower() or 'coding:' in token_string.lower():
                    f.write(token_string)
            elif token_type == tokenize.ENCODING:
                pass # Skip the synthetic ENCODING token
            else:
                f.write(token_string)

            last_lineno = end_line
            last_col = end_col
            
        # Clean up trailing whitespaces created by removing comments
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    with open(filename, 'w', encoding='utf-8') as f:
        for line in lines:
            if line.strip() == '':
                # If the line became completely empty, we can skip it or just put a newline
                # Let's keep it if it was originally an empty line, but if we stripped a comment it might be empty
                pass
            f.write(line.rstrip(' ') if line.endswith('\n') else line.rstrip())


def run():
    files_to_clean = []
    base = r'C:\Users\armut\404\Xiphos'
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '.venv', 'venv', '.next', '__pycache__', 'redis')]
        for file in files:
            if file.endswith('.py') and file != 'strip_comments.py':
                files_to_clean.append(os.path.join(root, file))

    for f in files_to_clean:
        try:
            remove_comments(f)
            print(f"Cleaned {f}")
        except Exception as e:
            print(f"Error on {f}: {e}")

if __name__ == '__main__':
    run()
