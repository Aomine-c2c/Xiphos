import os
from loguru import logger as log
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from typing import Optional

MODEL_NAME = 'gemini-2.5-flash'

# Initialize Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = None

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        log.info("Google Gemini (genai) core initialized.")
    except Exception as e:
        log.error(f"Failed to initialize Gemini client: {e}")
else:
    log.warning("GEMINI_API_KEY not found in environment. LLM functions will fallback to mocks.")

# ---------------------------------------------------------------------------
# Pydantic Schemas for Structured Outputs
# ---------------------------------------------------------------------------

class OracleDecisionSchema(BaseModel):
    mahoraga_reasoning: str = Field(description="The underlying market regime analysis and reasoning for the trade.")
    mahoraga_adjustment: str = Field(description="Any parameter adjustments or dynamic logic applied.")

class ParameterAdaptationSchema(BaseModel):
    should_adapt: bool = Field(description="True if the strategy parameters should be rotated based on current regime.")
    new_lot_multiplier: float = Field(description="The newly adapted lot size multiplier (e.g. 1.0 to 1.5).")
    new_sl_multiplier: float = Field(description="The newly adapted stop loss multiplier (e.g. 1.0 to 1.2).")
    reasoning: str = Field(description="Explanation of why this adaptation is mathematically optimal.")

# ---------------------------------------------------------------------------
# Vincent AI & Mahoraga Persona
# ---------------------------------------------------------------------------

import yaml
try:
    with open("config/prompts.yaml", "r") as f:
        _prompts = yaml.safe_load(f)
        VINCENT_SYSTEM_PROMPT = _prompts.get("system_prompts", {}).get("vincent_core", "")
except Exception as e:
    log.warning(f"Failed to load config/prompts.yaml: {e}. Falling back to default system prompt.")
    VINCENT_SYSTEM_PROMPT = "You are Vincent, the elite central intelligence for the Xiphos institutional trading platform."

# ---------------------------------------------------------------------------
# Core LLM Interface Functions
# ---------------------------------------------------------------------------

def generate_oracle_rationale(symbol: str, direction: str, price: float, ind_data: dict) -> OracleDecisionSchema:
    """Uses Gemini to generate organic trade rationale from raw indicator data."""
    if not client:
        return OracleDecisionSchema(
            mahoraga_reasoning="LLM offline. Regimes unknown.",
            mahoraga_adjustment="Fallback execution standard."
        )

    prompt = f"""
    We just executed a {direction} trade on {symbol} at {price}.
    Raw Indicator Data:
    {ind_data}
    
    As the master of the Mahoraga Technique, analyze this indicator matrix (the 'phenomenon'). 
    Explain exactly why this trade was a sound countermeasure.
    Provide the specific 'mahoraga_reasoning' (identifying the market regime/phenomenon) and 'mahoraga_adjustment' (how we adapted to it).
    """
    
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
        return OracleDecisionSchema(
            mahoraga_reasoning=f"Error generating rationale: {e}",
            mahoraga_adjustment="Fallback executed."
        )

def evaluate_adaptation(symbol: str, ind_data: dict, current_lot: float, current_sl: float) -> ParameterAdaptationSchema:
    """Uses Gemini to decide if parameters should be adapted based on market regime."""
    if not client:
        return ParameterAdaptationSchema(should_adapt=False, new_lot_multiplier=current_lot, new_sl_multiplier=current_sl, reasoning="LLM offline.")

    prompt = f"""
    Asset: {symbol}
    Current Lot Multiplier: {current_lot}
    Current SL Multiplier: {current_sl}
    
    Indicator Matrix (The Phenomenon):
    {ind_data}
    
    Analyze the volatility, trend, and momentum. Is this phenomenon inflicting damage or shifting in a way that warrants spinning the wheel?
    If yes, we must ADAPT. Yield 'should_adapt': true, and provide the countermeasure (new_lot_multiplier and new_sl_multiplier).
    If it's safe to continue, do not spin the wheel (should_adapt: false).
    Output the adaptation decision.
    """
    
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
        return ParameterAdaptationSchema(should_adapt=False, new_lot_multiplier=current_lot, new_sl_multiplier=current_sl, reasoning=str(e))

def generate_chat_response(messages: list, system_state_context: str) -> str:
    """Standard conversational endpoint for Vincent AI UI."""
    if not client:
        return "System Error: LLM Core Offline (GEMINI_API_KEY missing)."
    
    sys_prompt = f"{VINCENT_SYSTEM_PROMPT}\n\nLIVE SYSTEM STATE:\n{system_state_context}"
    
    # Format messages for the GenAI SDK
    formatted_messages = []
    for msg in messages:
        # Map roles to model/user
        role = "user" if msg.get("role") == "user" else "model"
        formatted_messages.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
    
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
        return f"Neural link disrupted: {e}"
