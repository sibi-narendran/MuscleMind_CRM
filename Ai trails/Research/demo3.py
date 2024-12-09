from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
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
        self.is_collecting_details = False

    def get_schema(self):
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
            | self.llm.bind(stop="\nSQL Query:")  # Stop after SQL Query is generated
            | StrOutputParser()
        )

    def collect_details(self, user_input):
        """
        Simulate dynamic detail collection based on user input.
        This handles different types of requests such as appointments creation, viewing, and canceling.
        """
        user_input = user_input.lower()

        if "appointment" in user_input:
            if "create" in user_input:
                self.collected_details["request_type"] = "appointment_create"
                self.is_collecting_details = True
                return "What date would you like to schedule the appointment for?"
            elif "cancel" in user_input:
                self.collected_details["request_type"] = "appointment_cancel"
                self.is_collecting_details = True
                return "Please provide the appointment ID or the name associated with the appointment you want to cancel."
            elif "next monday" in user_input:
                self.collected_details["request_type"] = "appointment_view_next_monday"
                self.is_collecting_details = False  # No details needed for this case
                return "Checking appointments for next Monday."
        
        if "name" not in self.collected_details:
            self.collected_details["name"] = user_input
            return "What time works best for you?"

        if "time" not in self.collected_details:
            self.collected_details["time"] = user_input
            return "Who is the appointment for?"

        if "dentist" not in self.collected_details:
            self.collected_details["dentist"] = user_input
            return f"To confirm, you'd like to create an appointment for {self.collected_details['name']} with {self.collected_details['dentist']} on {self.collected_details['date']} at {self.collected_details['time']}. Is that correct?"

        return None  # All details collected

    def execute_query(self, query):
        return self.db.run(query)

    def handle_request(self, user_input):
        if self.is_collecting_details:
            response = self.collect_details(user_input)
            if response is None:  # All details collected, generate and execute query
                collected_details_str = "\n".join([f"{key}: {value}" for key, value in self.collected_details.items()])
                # Generate SQL query chain
                intent_chain = self.generate_sql_chain()
                sql_query = intent_chain.invoke({
                    "question": user_input,
                    "collected_details": collected_details_str,
                    "schema": self.schema
                })
                result = self.execute_query(sql_query)
                self.is_collecting_details = False  # Stop collecting
                return f"Request processed successfully. {result}"
            else:
                return response
        else:
            # Handle specific requests when no details are needed
            if "next monday" in user_input:
                # Generate SQL query for appointments on the next Monday
                sql_query = "SELECT * FROM appointments WHERE appointment_date = 'next Monday';"
                result = self.execute_query(sql_query)
                return f"Here are the appointments for next Monday: {result}"

            return "Please provide more details to proceed with your request."

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
    api_key = "YOUR_API_KEY"
    chatbot = DentalCRMChatbot(api_key, db_path)
    chatbot.run_chatbot()


# Initialize the chatbot
if __name__ == "__main__":
    db_path = str(here("data")) + "/db.sqlite3"
    api_key = "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"
    chatbot = DentalCRMChatbot(api_key, db_path)
    chatbot.run_chatbot()
