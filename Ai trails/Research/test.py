import streamlit as st
from langchain.chat_models import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pyprojroot import here

# Initialize Chat Model
llm = ChatOpenAI(
    openai_api_key="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",
    model="gpt-4",
    temperature=0.0
)

# Load Database
db_path = str(here("data")) + "/db.sqlite3"  # Update the path to your SQLite database
db = SQLDatabase.from_uri(f"sqlite:///{db_path}")

# State management
if "collected_details" not in st.session_state:
    st.session_state.collected_details = {}
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# Helper function to get schema
def get_schema(_):
    return db.get_table_info()

# SQL Generation Prompt Template
sql_generation_template = """
You are a conversational AI assistant for a dental clinic CRM system. Your role is to assist users dynamically based on their requests.

### User Request:
{question}

### Current Context:
Details gathered so far:
{collected_details}

### Instructions:
1. Analyze the user's request to determine the action (e.g., creating an appointment, retrieving patient details, updating records, etc.).
2. Identify missing information required to fulfill the request.
3. If any details are missing, ask specific, clear questions to gather them.
4. Once all necessary details are collected, confirm the data with the user.
5. Generate an appropriate SQL query based on the request and gathered details.

### Database Schema:
{schema}

### SQL Query:
"""

# SQL Query Execution Prompt Template
response_generation_template = """
Based on the table schema below, question, SQL query, and response, write a natural language response:
{schema}

Question: {question}
SQL Query: {query}
SQL Response: {response}
"""

# Build Chains
sql_prompt = ChatPromptTemplate.from_template(sql_generation_template)
response_prompt = ChatPromptTemplate.from_template(response_generation_template)

sql_chain = (
    RunnablePassthrough.assign(schema=get_schema)
    | sql_prompt
    | llm.bind(stop="\nSQL Result:")
    | StrOutputParser()
)

def run_query(query):
    try:
        return db.run(query)
    except Exception as e:
        return f"Error executing query: {e}"

full_chain = (
    RunnablePassthrough.assign(query=sql_chain).assign(
        schema=get_schema,
        response=lambda variables: run_query(variables["query"]),
    )
    | response_prompt
    | llm
)

# Streamlit app
def main():
    st.title("Dental Clinic CRM Assistant")
    
    collected_details = st.session_state.collected_details
    chat_history = st.session_state.chat_history
    
    # Display chat history
    for chat in chat_history:
        st.write(chat)

    user_input = st.text_input("You:", "")
    
    if st.button("Submit"):
        if user_input:
            # Process the user input
            response = sql_chain.invoke({"question": user_input, "collected_details": collected_details})
            chat_history.append(f"You: {user_input}")

            # Check if the response includes a SQL query
            if "SQL Query:" in response:
                # Extract the SQL query
                sql_query = response.split("SQL Query:")[-1].strip()
                st.write("AI: Executing SQL Query...")
                sql_response = run_query(sql_query)
                
                # Generate a natural language response
                final_response = response_prompt.invoke({
                    "schema": get_schema(None),
                    "question": user_input,
                    "query": sql_query,
                    "response": sql_response
                })
                chat_history.append(f"AI: {final_response }")
            else:
                # If the AI is asking for more details, update collected_details
                if "Could you please provide" in response:
                    detail_requested = response.split("Could you please provide")[-1].strip().split("?")[0].strip()
                    chat_history.append(f"AI: Could you please provide {detail_requested}?")
                    user_response = st.text_input(f"AI: Could you please provide {detail_requested}?\nYou:", "")
                    if user_response:
                        collected_details[detail_requested] = user_response
                        chat_history.append(f"You: {user_response}")
                else:
                    chat_history.append(f"AI: {response}")  # Just print the response if it's not a request for details

if __name__ == "__main__":
    main()