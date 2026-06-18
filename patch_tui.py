import re

with open("tui.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Extract duplicated literals
if 'ID_POS_PANEL = "#positions-panel"' not in content:
    content = content.replace('CURRENT_VERSION = "v2.0.0"', 'CURRENT_VERSION = "v2.0.0"\n\nID_POS_PANEL = "#positions-panel"\nID_DASH_POS_PANEL = "#dash-pos-panel"\nID_LOG_PANEL = "#log-panel"\nID_MW_PANEL = "#mw-panel"\nID_DASH_MW_PANEL = "#dash-mw-panel"')
    
content = content.replace('\'#positions-panel\'', 'ID_POS_PANEL')
content = content.replace('"#positions-panel"', 'ID_POS_PANEL')
content = content.replace('\'#dash-pos-panel\'', 'ID_DASH_POS_PANEL')
content = content.replace('"#dash-pos-panel"', 'ID_DASH_POS_PANEL')
content = content.replace('\'#log-panel\'', 'ID_LOG_PANEL')
content = content.replace('"#log-panel"', 'ID_LOG_PANEL')
content = content.replace('\'#mw-panel\'', 'ID_MW_PANEL')
content = content.replace('"#mw-panel"', 'ID_MW_PANEL')
content = content.replace('\'#dash-mw-panel\'', 'ID_DASH_MW_PANEL')
content = content.replace('"#dash-mw-panel"', 'ID_DASH_MW_PANEL')

# 2. Fix lambda
content = content.replace('fmt_d = lambda d: f"[green]+{d:.0f}[/]" if d > 0 else f"[red]{d:.0f}[/]" if d < 0 else "0"', 'def fmt_d(d): return f"[green]+{d:.0f}[/]" if d > 0 else f"[red]{d:.0f}[/]" if d < 0 else "0"')

# 3. Fix multiple statements
content = content.replace('conn_str = "[bold red]● OFFLINE[/bold red]"\n            bal_str = eq_str = mg_str = pnl_str = "[dim]N/A[/dim]"\n            slots_us, slots_av, sl_c = 0, 0, "red"',
                          'conn_str = "[bold red]● OFFLINE[/bold red]"\n            bal_str = "[dim]N/A[/dim]"\n            eq_str = "[dim]N/A[/dim]"\n            mg_str = "[dim]N/A[/dim]"\n            pnl_str = "[dim]N/A[/dim]"\n            slots_us = 0\n            slots_av = 0\n            sl_c = "red"')

with open("tui.py", "w", encoding="utf-8") as f:
    f.write(content)

print("tui.py patched.")
