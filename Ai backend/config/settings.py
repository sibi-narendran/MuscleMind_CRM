from dotenv import load_dotenv
import os

load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DB_URL = os.getenv("DATABASE_URL")
LLM_MODEL = "gpt-3.5-turbo"
LLM_TEMPERATURE = 0.0