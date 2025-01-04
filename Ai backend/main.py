from fastapi import FastAPI, HTTPException
from pydantic.v1 import BaseModel
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Dental CRM API")

# Database configuration
DB_URL = os.getenv("DATABASE_URL")
db = SQLDatabase.from_uri(DB_URL)

# LLM configuration
llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-3.5-turbo",
    temperature=0.0
)

# Prompt templates
sql_template = """
Based on the table schema below, write a postgres syntax based SQL query that would answer the users question:
{schema}
Question: {question}
SQL Query:
"""

response_template = """
Based on the table schema below, question, sql query, and response, write a natural language response:
{schema}

Question: {question}
SQL query: {query}
SQL Response: {response}
"""

# Create prompt templates
sql_prompt = ChatPromptTemplate.from_template(sql_template)
response_prompt = ChatPromptTemplate.from_template(response_template)

# Helper functions
def get_schema(_):
    return db.get_table_info()

def run_query(query):
    try:
        return db.run(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Create chains
sql_chain = (
    RunnablePassthrough.assign(schema=get_schema)
    | sql_prompt
    | llm.bind(stop="\nSQL Result:")
    | StrOutputParser()
)

full_chain = (
    RunnablePassthrough.assign(query=sql_chain).assign(
        schema=get_schema,
        response=lambda variables: run_query(variables["query"])
    )
    | response_prompt
    | llm
)

# Pydantic models
class Query(BaseModel):
    question: str

class QueryResponse(BaseModel):
    question: str
    sql_query: str
    sql_response: str
    natural_response: str

@app.post("/query", response_model=QueryResponse)
async def process_query(query: Query):
    try:
        # Get SQL query
        sql_query = sql_chain.invoke({"question": query.question})
        
        # Execute SQL query
        sql_response = run_query(sql_query)
        
        # Get natural language response
        natural_response = full_chain.invoke({"question": query.question})
        
        return QueryResponse(
            question=query.question,
            sql_query=sql_query,
            sql_response=sql_response,
            natural_response=natural_response.content
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/schema")
async def get_database_schema():
    try:
        return {"schema": get_schema(None)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)