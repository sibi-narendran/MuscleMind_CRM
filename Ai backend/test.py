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
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage
from datetime import datetime
import json


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


# Add Memory Management Class
class ChatMemoryManager:
    def __init__(self, db_url: str):
        self.message_history = SQLChatMessageHistory(
            session_id="default",
            connection_string=db_url
        )

    def add_interaction(self, question: str, response: str):
        self.message_history.add_message(HumanMessage(content=question))
        self.message_history.add_message(AIMessage(content=response))

    def get_recent_history(self, limit: int = 5):
        return self.message_history.messages[-limit:]



# Prompt templates
sql_template = """
Based on the table schema below and the conversation history, write a postgres syntax based SQL query that would answer the users question:
{schema}

Previous conversation:
{history}

Current Question: {question}
SQL Query:
"""

response_template = """
Based on the table schema, conversation history, question, sql query, and response, write a natural language response.

IMPORTANT: Never include the following sensitive information in your response:
- UUID, ID numbers, or any unique identifiers
- Created at, Updated at, or Deleted at timestamps
- Internal system fields
- Any sensitive medical information not directly related to the query

Schema:
{schema}

Previous conversation:
{history}

Current Question: {question}
SQL query: {query}
SQL Response: {response}

Guidelines for your response:
1. Focus on relevant business information only
2. Use patient names instead of IDs when available
3. Format dates in a human-readable way (e.g., "March 20, 2024" instead of timestamps)
4. Round monetary values to two decimal places
5. If sensitive fields are present in the SQL response, exclude them from your natural language response
6. For appointments, mention only date, time, and patient name
7. For treatments, mention only name, date, and cost
8. For invoices, mention only invoice number, total amount, and payment status

Please provide a clear, concise response following these guidelines.

Generate:
1. Matching records found (if applicable)
"""

# Create prompt templates
sql_prompt = ChatPromptTemplate.from_template(sql_template)
response_prompt = ChatPromptTemplate.from_template(response_template)


# Add new prompt template for intent classification
intent_template = """
Analyze if the following question requires database access or if it's a general dental query.
Respond with either "database" or "general".

Question: {question}
Classification:"""

intent_prompt = ChatPromptTemplate.from_template(intent_template)

# Add intent classification chain
intent_chain = (
    intent_prompt
    | llm.bind(temperature=0)
    | StrOutputParser()
)

# Add general dental query prompt
dental_template = """
You are a dental assistant AI. Please answer the following dental-related question, taking into account the previous conversation context:

Previous conversation:
{history}

Current Question: {question}

Provide a clear and professional response."""

dental_prompt = ChatPromptTemplate.from_template(dental_template)

# Add dental response chain
dental_chain = (
    dental_prompt
    | llm
    | StrOutputParser()
)



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


memory_manager = ChatMemoryManager(DB_URL)


@app.post("/query", response_model=QueryResponse)
async def process_query(query: Query):
    try:
        # Get conversation history
        history = memory_manager.get_recent_history()
        history_str = "\n".join([f"{'User' if isinstance(msg, HumanMessage) else 'AI'}: {msg.content}" 
                               for msg in history])

        # Determine the intent
        intent = intent_chain.invoke({
            "question": query.question,
            "history": history_str
        })
        
        if intent.strip().lower() == "database":
            # Database query logic with history
            sql_query = sql_chain.invoke({
                "question": query.question,
                "history": history_str
            })
            sql_response = run_query(sql_query)
            natural_response = full_chain.invoke({
                "question": query.question,
                "history": history_str
            })
            
            response = QueryResponse(
                question=query.question,
                sql_query=sql_query,
                sql_response=sql_response,
                natural_response=natural_response.content
            )
        else:
            # General dental query with history
            dental_response = dental_chain.invoke({
                "question": query.question,
                "history": history_str
            })
            
            response = QueryResponse(
                question=query.question,
                sql_query="N/A",
                sql_response="N/A",
                natural_response=dental_response
            )

        # Store the interaction in memory
        memory_manager.add_interaction(query.question, response.natural_response)
        
        return response
            
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

# Add endpoint to retrieve conversation history
@app.get("/conversation-history/{limit}")
async def get_conversation_history(limit: int = 5):
    try:
        history = memory_manager.get_recent_history(limit)
        return {
            "history": [
                {
                    "role": "user" if isinstance(msg, HumanMessage) else "ai",
                    "content": msg.content
                }
                for msg in history
            ]
        }
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