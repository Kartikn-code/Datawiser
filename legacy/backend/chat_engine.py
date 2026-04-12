import google.generativeai as genai
import os
from dotenv import load_dotenv
from insights_engine import calculate_metrics, records_to_dataframe

load_dotenv()

def generate_insights(messages: list, context_data: dict) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _local_fallback(messages, context_data)
    
    try:
        genai.configure(api_key=api_key)
        # Using gemini-1.5-flash since it's free, incredibly fast, and smart
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Build strict system boundary context
        system_prompt = (
            "You are an expert transport analytics copilot for Datawiser. "
            "Keep responses concise, practical, and action oriented for transport businesses. "
            "Use markdown bullets and include concrete metrics from the context when available.\n"
            f"Current Dataset Statistics: {context_data.get('stats', 'Unknown')}\n"
            f"Available Columns: {context_data.get('columns', 'Unknown')}\n\n"
            f"Sample Rows (First 5): {str(context_data.get('preview', []))[:1000]}\n"
        )
        
        # Format history mapping React 'user|assistant' to Gemini 'user|model'
        history = []
        for msg in messages[:-1]:
            role = "user" if msg["role"] == "user" else "model"
            # Gemini strictly forbids history starting with a 'model' response
            if not history and role == "model":
                continue
            # Gemini strictly forbids consecutive messages of the same role
            if history and history[-1]["role"] == role:
                history[-1]["parts"][0] += f"\n\n{msg['content']}"
            else:
                history.append({"role": role, "parts": [msg["content"]]})
            
        chat = model.start_chat(history=history)
        
        last_message = messages[-1]["content"]
        prompt = f"[SYSTEM CONTEXT INSTRUCTIONS]\n{system_prompt}\n\n[USER QUESTION]\n{last_message}"
        
        response = chat.send_message(prompt)
        return response.text
    except Exception as e:
        return _local_fallback(messages, context_data)


def _local_fallback(messages: list, context_data: dict) -> str:
    preview = context_data.get("preview") or []
    df = records_to_dataframe(preview)
    metrics = calculate_metrics(df)
    question = (messages[-1]["content"] if messages else "").lower()

    if "route" in question and "profit" in question:
        top = metrics.get("route_stats", [])
        if top:
            return f"Most profitable route is **{top[0]['route']}** with profit **{top[0]['profit']:.2f}**."

    if "least" in question and "truck" in question:
        trucks = sorted(metrics.get("truck_stats", []), key=lambda x: x["revenue"])
        if trucks:
            t = trucks[0]
            return f"Lowest revenue truck is **{t['truck']}** at **{t['revenue']:.2f}**."

    return (
        "I can still help without external AI access.\n"
        f"- Total revenue: **{metrics.get('total_revenue', 0):,.2f}**\n"
        f"- Profit/Loss: **{metrics.get('profit_loss', 0):,.2f}**\n"
        f"- Pending deliveries: **{metrics.get('pending_deliveries', 0)}**\n"
        "Ask about route profitability, truck performance, or monthly trends."
    )
