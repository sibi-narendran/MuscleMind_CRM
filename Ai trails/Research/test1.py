import openai
from langchain.chat_models import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pyprojroot import here

# Initialize the LLM
llm = ChatOpenAI(
    openai_api_key="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",  # Replace with your OpenAI API key
    model="gpt-4",
    temperature=0.0
)

# Define the prompt template
template = """
You are a conversational AI assistant for a dental clinic CRM system. Your role is to assist users by understanding their requests, gathering necessary details through conversation, validating inputs, and performing actions.

### Instructions:
- Identify the user's intent (e.g., create an appointment, reschedule).
- Dynamically ask for missing details step-by-step.
- Validate user inputs and ensure they meet expected formats (e.g., date, time).
- Confirm details with the user before generating SQL queries.
- Generate SQL queries to interact with the database and respond conversationally.

### Example Interaction:
User: "I want to create a new appointment."
AI: "Please provide the patient's full name."
User: "John Doe"
AI: "What date and time would you like the appointment?"
User: "December 10th, 10 AM"
AI: "Just to confirm, you'd like to schedule an appointment for John Doe on December 10th at 10 AM. Is that correct?"
User: "Yes"
AI: *Generates SQL query*

### Database Schema:
{schema}

Output:
- Generate SQL queries as required and provide a user-friendly response.
"""

prompt = ChatPromptTemplate.from_template(template)

# Load the database
db_path = str(here("data")) + "/db.sqlite3"
db = SQLDatabase.from_uri(f"sqlite:///{db_path}")

# Retrieve database schema
def get_schema():
    return db.get_table_info()

# Define the SQL chain
sql_chain = (
    RunnablePassthrough.assign(schema=lambda _: get_schema())
    | prompt
    | llm.bind(stop="\nSQL Result:")
    | StrOutputParser()
)

# Function to execute SQL queries
def run_query(query):
    try:
        return db.run(query)
    except Exception as e:
        return f"Error executing query: {str(e)}"

# Terminal-based interaction for dynamic queries
def start_interaction():
    print("Welcome to the Dental Clinic Appointment Assistant!")

    while True:
        user_input = input("\nAsk your question or type 'exit' to quit: ").strip()

        if user_input.lower() == 'exit':
            print("Goodbye!")
            break

        if user_input:
            try:
                # Process the user's input through the SQL chain
                query_result = sql_chain.invoke({"question": user_input})

                # Debug: Display generated query result
                print("\nGenerated Query Result:", query_result)

                if isinstance(query_result, dict) and "query" in query_result:
                    # Execute the generated query
                    query_response = run_query(query_result["query"])

                    # Generate the final response
                    response_template = """
                    Using the schema, user question, SQL query, and database response below, generate a conversational response.

                    Schema:
                    {schema}

                    Question: {question}
                    SQL Query: {query}
                    SQL Response: {response}
                    """
                    response_prompt = ChatPromptTemplate.from_template(response_template)

                    final_response = llm.invoke({
                        "schema": get_schema(),
                        "question": user_input,
                        "query": query_result["query"],
                        "response": query_response,
                    })

                    # Display the final conversational response
                    print("\nFinal Response:")
                    print(final_response)
                else:
                    print("No valid SQL query was generated. Please provide more details or rephrase your request.")

            except Exception as e:
                print(f"An error occurred: {str(e)}")
        else:
            print("Please enter a valid question.")

# Start the interaction
if __name__ == "__main__":
    start_interaction()
