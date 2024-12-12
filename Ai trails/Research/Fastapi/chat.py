from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_community.utilities import SQLDatabase
from langchain_huggingface import HuggingFaceEndpoint
from langchain_community.agent_toolkits import create_sql_agent
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_community.agent_toolkits.sql.base import SQLDatabaseToolkit
from supabase import create_client, Client

# Initialize FastAPI
app = FastAPI()

# Initialize Supabase client
SUPABASE_URL = "https://ltxnbtvdxdtrobskpjsw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG5idHZkeGR0cm9ic2twanN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MzYyNzAsImV4cCI6MjA0NzMxMjI3MH0.814eiBys7Q_N1DrAyVJ2B2gs2Zgyf0VHZjSTsLPhlgY"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Langchain LLM
llm = ChatOpenAI(
    openai_api_key="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",
    model="gpt-4",
    temperature=0.2
)

# Define the custom prompt
custom_prompt = """
You are an advanced SQL assistant for a dental clinic database. The database schema consists of the following models:
...
User  Request: {input}
SQL Query: {agent_scratchpad}
"""

# Setup the toolkit
toolkit = SQLDatabaseToolkit(llm=llm, db=supabase)

# Create the agent executor
agent_executor = create_sql_agent(
    llm=llm,
    db=supabase,
    agent_type="openai-tools",
    verbose=True,
    prompt=PromptTemplate(
        template=custom_prompt,
        input_variables=["input", "agent_scratchpad"]
    )
)

# Define the request model
class AppointmentRequest(BaseModel):
    input: str

# Create an endpoint for creating appointments
@app.post("/appointments/")
async def create_appointment(request: AppointmentRequest):
    try:
        response = agent_executor.invoke({"input": request.input})
        return {"sql_query": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

#Run the application (if you want to run it directly)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    