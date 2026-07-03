from pathlib import Path

path = Path(r'C:\Users\armut\404\Xiphos\core\engine.py')
lines = path.read_text(encoding='utf-8').splitlines()

start = 179  # 1-indexed target block start
end = 198    # inclusive for replacement

new_block = [
    "            ind_data = get_m30_indicators(sym)",
    "",
    "            if not ind_data:",
    "",
    "                continue",
    "",
    "                ",
    "",
    "            mahoraga_engine.evaluate(sym, ind_data, recent_win_rate)",
    "",
    "            params = mahoraga_engine.get_parameters(sym)",
    "",
    "            is_default_params = params.fast_ema == 13 and params.medium_ema == 50 and params.slow_sma == 200",
    "",
    "            if not is_default_params:",
    "",
    "                ind_data = get_m30_indicators(sym, fast=params.fast_ema, medium=params.medium_ema, slow=params.slow_sma)",
    "",
    "            if not ind_data:",
    "",
    "                continue",
    "",
    "                ",
    "",
    "            ind_data[\"filter_strictness\"] = params.filter_strictness",
    "            ind_data[\"lot_multiplier\"] = params.lot_multiplier",
    "            ind_data[\"sl_multiplier\"] = params.sl_multiplier",
    "",
    "            candle_time = ind_data.get('time', 0)",
]

updated_lines = lines[:start-1] + new_block + lines[end:]
path.write_text('\n'.join(updated_lines), encoding='utf-8')
print('patched', path)
