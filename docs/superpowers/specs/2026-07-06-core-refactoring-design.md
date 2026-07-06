# Core Refactoring & Stability Design

## Objective
Refactor critical components of the Xiphos system (`core/engine.py`, `core/mahoraga.py`, and `xiphos.py`) to reduce cyclomatic complexity, decouple state management from network calls, and harden cross-platform process orchestration.

## Section 1: Decoupling `core/engine.py`
**Problem:** `_execute_signal` is a massive monolith handling session filtering, correlation blocking, lot sizing, stop loss calculation, and MT5 API execution, resulting in high cyclomatic complexity.
**Solution:**
Break down `_execute_signal` into:
1. `_check_trade_validity(sig, open_counts, session_blocked_buckets)`: Returns a boolean indicating if the trade passes session, open count, and correlation filters.
2. `_calculate_position_params(sig, tick)`: Calculates and returns `entry_price`, `adapted_lot`, `sl_scalper`, `sl_runner`, and `order_type`.
3. `_execute_trade_pair(...)`: Handles the MT5 `open_trade` calls for the Scalper and Runner positions and oracle recording.

## Section 2: Cleaning up `core/mahoraga.py`
**Problem:** The `evaluate` function mixes phenomenon calculation, adaptation logic, LLM network calls, and state updates, creating a deeply nested, complex method.
**Solution:**
1. Extract the core state mutation logic (wheel spins/damage) into a focused method `_apply_damage_and_check_adaptation(current_phenomenon, recent_win_rate, params)`.
2. Extract the LLM execution and subsequent parameter updates into `_execute_llm_adaptation(symbol, ind_data, params, current_phenomenon)`.
3. The main `evaluate` method will simply sequence these well-named steps.

## Section 3: Hardening Orchestration (`xiphos.py`)
**Problem:** `pre_flight_cleanup()` relies on brittle shell commands (`taskkill`, `powershell`) to find and kill orphaned processes, which is OS-dependent and unsafe.
**Solution:**
Introduce `psutil` to handle process management cleanly.
1. Iterate over `psutil.process_iter(['name', 'cmdline'])`.
2. Terminate matching processes (`redis-server`, `node`, or `python` instances running `api_server.py`/`worker_engine.py`).
3. Note: This will require ensuring `psutil` is in the project dependencies (e.g., `pyproject.toml`).
