from langchain.chat_models import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.utilities import SQLDatabase
from pyprojroot import here
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

class DentalCRMChatbot:
    def __init__(self, api_key, db_path):
        self.llm = ChatOpenAI(
            openai_api_key=api_key,
            model="gpt-4",
            temperature=0.0
        )
        self.db = SQLDatabase.from_uri(f"sqlite:///{db_path}")
        self.schema = self.get_schema()
        self.prompt_template = self.create_prompt_template()
        self.collected_details = {}  # Store key-value pairs for context

    def get_schema(self, *args):
        return self.db.get_table_info()

    def create_prompt_template(self):
        template = """
        You are a conversational AI assistant for a dental clinic CRM system. Your role is to assist users dynamically based on their requests.

        ### User Request:
        {question}

        ### Current Context:
        Details gathered so far:
        {collected_details}

        ### Database Schema:
        {schema}

        ### Instructions:
        1. Analyze the user's request to determine the intent and action (e.g., creating an appointment, fetching details, updating records).
        2. Identify missing information required to fulfill the request and ask the user for it conversationally.
        3. Once sufficient details are collected, generate an appropriate SQL query.
        4. Execute the SQL query and return the result in natural language.

        ### SQL Query:
        """
        return ChatPromptTemplate.from_template(template)

    def generate_sql_chain(self):
        return (
            RunnablePassthrough.assign(schema=self.get_schema)
            | self.prompt_template
            | self.llm.bind(stop="\nSQL Query:")
            | StrOutputParser()
        )

    def collect_details(self, user_input):
        """
        Simulate dynamic detail collection based on user input.
        Adjust this logic to handle dBifferent request types.
        """
        # Example parsing logic (you can expand this for more cases):
        if "appointment" in user_input.lower():
            self.collected_details["request_type"] = "appointment"
        elif "details" in user_input.lower():
            self.collected_details["request_type"] = "details"
        elif "update" in user_input.lower():
            self.collected_details["request_type"] = "update"

        # Add more specific details dynamically
        if "name" in user_input.lower():
            self.collected_details["name"] = user_input.split("name")[-1].strip()
        elif "time" in user_input.lower():
            self.collected_details["time"] = user_input.split("time")[-1].strip()

    def execute_query(self, query):
        return self.db.run(query)

    def handle_request(self, user_input):
        # Collect details dynamically
        self.collect_details(user_input)
        collected_details_str = "\n".join(
            [f"{key}: {value}" for key, value in self.collected_details.items()]
        )
        
        # Dynamically identify intent and handle missing information
        intent_chain = self.generate_sql_chain()
        sql_query = intent_chain.invoke({
            "question": user_input,
            "collected_details": collected_details_str,
            "schema": self.schema
        })
        result = self.execute_query(sql_query)
        return result

    def run_chatbot(self):
        print("Dental CRM Chatbot is now running. Type 'exit' to stop.")
        while True:
            user_input = input("User: ")
            if user_input.lower() == "exit":
                print("Exiting chatbot. Goodbye!")
                break
            try:
                response = self.handle_request(user_input)
                print(f"AI: {response}")
            except Exception as e:
                print(f"AI: Sorry, I couldn't process your request due to an error: {e}")


# Initialize the chatbot
if __name__ == "__main__":
    db_path = str(here("data")) + "/db.sqlite3"
    api_key = "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"
    chatbot = DentalCRMChatbot(api_key, db_path)
    chatbot.run_chatbot()
