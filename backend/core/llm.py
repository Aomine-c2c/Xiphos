import os

import json

import re

import urllib.request

from loguru import logger as log

from pydantic import BaseModel, Field

try:
    from google import genai
    from google.genai import types
    _GOOGLE_GENAI_AVAILABLE = True
except Exception:
    _GOOGLE_GENAI_AVAILABLE = False
    genai = None
    types = None

from typing import Optional



MODEL_NAME = 'gemini-2.5-flash'



GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = None
if GEMINI_API_KEY and _GOOGLE_GENAI_AVAILABLE:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        log.info("Google Gemini (genai) core initialized.")
    except Exception as e:
        log.error(f"Failed to initialize Gemini client: {e}")
else:
    if not _GOOGLE_GENAI_AVAILABLE:
        log.warning("google-genai package unavailable; offline/local inference only.")
    log.warning("GEMINI_API_KEY not found/invalid. LLM functions will fallback to local/mock.")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")


def _extract_json(text: str) -> str:
    if not text:
        return ""
    try:
        data = json.loads(text)
        return json.dumps(data)
    except Exception:
        pass
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        candidate = match.group(0)
        try:
            data = json.loads(candidate)
            return json.dumps(data)
        except Exception:
            pass
    return ""


def _ollama_generate(prompt: str, schema_hint: str = "", system_prompt: str = "") -> str:
    body = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1 if schema_hint else 0.5,
            "num_ctx": 2048
        },
        "system": system_prompt or "You are Vincent, the elite central intelligence for the Xiphos institutional trading platform. Output compact, structured reasoning."
    }).encode()
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/generate",
        data=body,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=240) as resp:
            data = json.loads(resp.read().decode())
            text = data.get("response", "")
            if schema_hint:
                extracted = _extract_json(text)
                if extracted:
                    return extracted
            return text
    except Exception as e:
        log.error(f"Ollama local inference failed: {e}")
        return ""


def _ollama_available() -> bool:
    try:
        with urllib.request.urlopen(f"{OLLAMA_URL}/", timeout=2) as resp:
            return resp.status == 200
    except Exception:
        return False


def _local_or_remote_generate(prompt: str, schema_hint: str = "", system_prompt: str = "") -> str:
    if _ollama_available():
        return _ollama_generate(prompt, schema_hint=schema_hint, system_prompt=system_prompt)
    return "{}"


class OracleDecisionSchema(BaseModel):
    mahoraga_reasoning: str = Field(description="The underlying market regime analysis and reasoning for the trade.")
    mahoraga_adjustment: str = Field(description="Any parameter adjustments or dynamic logic applied.")

class ParameterAdaptationSchema(BaseModel):
    should_adapt: bool = Field(description="True if the strategy parameters should be rotated based on current regime.")
    halt_trading: bool = Field(description="True if trading should be completely halted.")
    strategy_override: str = Field(description="The underlying strategy to use. Default is 'TREND_FOLLOWING'.")
    new_lot_multiplier: float = Field(description="The newly adapted lot size multiplier (e.g. 1.0 to 1.5).")
    new_sl_multiplier: float = Field(description="The newly adapted stop loss multiplier (e.g. 1.0 to 1.2).")
    new_tp_multiplier: float = Field(description="The newly adapted take profit multiplier (e.g. 1.0 to 3.0).")
    reasoning: str = Field(description="Explanation of why this adaptation is mathematically optimal.")

class MistakeAnalysisSchema(BaseModel):
    ai_explanation: str = Field(description="Objective explanation of the trade's context and outcome based on the data.")
    mistake_analysis: str = Field(description="Analysis of any mistakes, deviations, or poor execution logic.")
    lessons_learned: str = Field(description="Actionable takeaways or rules to improve future execution.")


import yaml
try:
    with open("config/prompts.yaml", "r") as f:
        _prompts = yaml.safe_load(f)
        VINCENT_SYSTEM_PROMPT = _prompts.get("system_prompts", {}).get("vincent_core", "")
except Exception as e:
    log.warning(f"Failed to load config/prompts.yaml: {e}. Falling back to default system prompt.")
    VINCENT_SYSTEM_PROMPT = "You are Vincent, the elite central intelligence for the Xiphos institutional trading platform."


def generate_oracle_rationale(symbol: str, direction: str, price: float, ind_data: dict) -> OracleDecisionSchema:
    """Uses Gemini or local Ollama to generate organic trade rationale."""
    prompt = f"""
We just executed a {direction} trade on {symbol} at {price}.
Raw Indicator Data:
{ind_data}
Analyze this indicator matrix. Explain why this trade was a sound countermeasure.
Output JSON: {{"mahoraga_reasoning": "...", "mahoraga_adjustment": "..."}}
"""
    if client:
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=OracleDecisionSchema,
                    system_instruction=VINCENT_SYSTEM_PROMPT,
                    temperature=0.2
                )
            )
            return response.parsed
        except Exception as e:
            log.error(f"Oracle rationale generation failed: {e}")

    try:
        local = _local_or_remote_generate(prompt, schema_hint="OracleDecisionSchema", system_prompt=VINCENT_SYSTEM_PROMPT)
        data = json.loads(local)
        return OracleDecisionSchema(**data)
    except Exception:
        return OracleDecisionSchema(mahoraga_reasoning="LLM offline.", mahoraga_adjustment="Fallback standard.")


def evaluate_adaptation(symbol: str, ind_data: dict, current_lot: float, current_sl: float, news_data: dict = None, macro_data: dict = None, l2_data: dict = None) -> ParameterAdaptationSchema:
    """Uses Gemini or local Ollama to decide if parameters should be adapted."""
    prompt = f"""
Asset: {symbol}
Current Lot Multiplier: {current_lot}
Current SL Multiplier: {current_sl}

Indicator Matrix (The Phenomenon):
{ind_data}

News & Sentiment Data:
{news_data}

Macroeconomic Data:
{macro_data}

Order Book / L2 Imbalance:
{l2_data}

Analyze the volatility, trend, momentum, sentiment, and macro context.
Is this phenomenon inflicting damage or shifting in a way that warrants spinning the wheel?
If yes, we must ADAPT. Yield 'should_adapt': true, and provide the countermeasure.
If it's safe to continue, do not spin the wheel (should_adapt: false).

CRITICAL RULES:
1. If there is an extreme, unreadable macro shock (e.g., NFP/CPI dropping right now), set 'halt_trading': true.
2. If momentum is diverging and order book flips heavily, you may change 'strategy_override' from 'TREND_FOLLOWING' to 'MEAN_REVERSION'.
3. Adjust 'new_tp_multiplier' (Take Profit) dynamically based on how far you expect the move to run (default 1.0).

Output JSON with keys: should_adapt, halt_trading, strategy_override, new_lot_multiplier, new_sl_multiplier, new_tp_multiplier, reasoning.
"""
    if client:
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ParameterAdaptationSchema,
                    system_instruction=VINCENT_SYSTEM_PROMPT,
                    temperature=0.1
                )
            )
            return response.parsed
        except Exception as e:
            log.error(f"Mahoraga adaptation generation failed: {e}")

    try:
        local = _local_or_remote_generate(prompt, schema_hint="ParameterAdaptationSchema", system_prompt=VINCENT_SYSTEM_PROMPT)
        data = json.loads(local)
        return ParameterAdaptationSchema(**data)
    except Exception:
        return ParameterAdaptationSchema(
            should_adapt=False,
            halt_trading=False,
            strategy_override="TREND_FOLLOWING",
            new_lot_multiplier=current_lot,
            new_sl_multiplier=current_sl,
            new_tp_multiplier=1.0,
            reasoning="Local fallback active; parameters unchanged."
        )


def generate_chat_response(messages: list, system_state_context: str) -> str:
    sys_prompt = f"{VINCENT_SYSTEM_PROMPT}\n\nLIVE SYSTEM STATE:\n{system_state_context}"
    formatted_messages = []
    for msg in messages:
        role = "user" if msg.get("role") == "user" else "model"
        formatted_messages.append({"role": role, "parts": [{"text": msg.get("content", "")}]})

    if client:
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=formatted_messages,
                config=types.GenerateContentConfig(
                    system_instruction=sys_prompt,
                    temperature=0.5
                )
            )
            return response.text
        except Exception as e:
            log.error(f"Vincent AI chat failed: {e}")

    user_text = "\n".join([m.get("content", "") for m in messages if m.get("role") == "user"])
    prompt = f"{sys_prompt}\n\nUser: {user_text}\nVincent:"
    local = _local_or_remote_generate(prompt, system_prompt=sys_prompt)
    return local or "Neural link disrupted: local inference unavailable."


def analyze_trade_mistakes(trade_data: dict) -> MistakeAnalysisSchema:
    """Uses Gemini or local Ollama to generate a deep-dive analysis of a completed trade."""
    prompt = f"""
You are Vincent, the AI trading coach for the Xiphos system.
Please review the following completed trade and provide a Deep Dive Mistake Analysis.

Trade Context:
Symbol: {trade_data.get('symbol')}
Type: {trade_data.get('type')}
Profit: ${trade_data.get('profit', 0):.2f}
Entry Price: {trade_data.get('entry_price')}
Trader Notes: {trade_data.get('notes', 'No notes provided.')}
Holding Time (mins): {trade_data.get('holding_time_mins', 0):.1f}
MAE (Max Adverse Excursion): {trade_data.get('mae', 0):.5f}
MFE (Max Favorable Excursion): {trade_data.get('mfe', 0):.5f}

Analyze this trade based on the outcome, the trader's notes, and the execution metrics.
Provide an objective explanation, identify any mistakes or emotional deviations, and synthesize lessons learned.
Output JSON with keys: ai_explanation, mistake_analysis, lessons_learned.
"""
    if client:
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=MistakeAnalysisSchema,
                    system_instruction=VINCENT_SYSTEM_PROMPT,
                    temperature=0.3
                )
            )
            return response.parsed
        except Exception as e:
            log.error(f"Mistake analysis generation failed: {e}")

    local = _local_or_remote_generate(prompt, schema_hint="MistakeAnalysisSchema", system_prompt=VINCENT_SYSTEM_PROMPT)
    try:
        data = json.loads(local)
        return MistakeAnalysisSchema(**data)
    except Exception:
        return MistakeAnalysisSchema(
            ai_explanation="LLM offline. Unable to analyze trade.",
            mistake_analysis="Check local inference or restore Gemini.",
            lessons_learned="Retry later."
        )

