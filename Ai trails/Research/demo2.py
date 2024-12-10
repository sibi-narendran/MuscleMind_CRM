import logging
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_community.utilities import SQLDatabase
from pyprojroot import here

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class DentalCRMChatbot:
    def __init__(self, api_key, db_path):
        logging.debug("Initializing DentalCRMChatbot")
        self.llm = ChatOpenAI(
            openai_api_key=api_key,
            model="gpt-4",
            temperature=0.0
        )
        self.db = SQLDatabase.from_uri(f"sqlite:///{db_path}")
        self.schema = self.get_schema()

        self.session_state = {
            "step": 0,
            "collected_details": {},
            "intent": None,
            "missing_details": None,
            "sql_query": None,
        }

        self.prompts = self.create_prompts()

    def get_schema(self):
        logging.debug("Fetching database schema")
        return self.db.get_table_info()

    
    def create_prompts(self):
        # Create prompt templates for each part of the conversation
        return {
            "intent_identification": ChatPromptTemplate.from_template("""
                You are an AI assistant for a dental clinic CRM. Identify the user's intent (e.g., create appointment, get details, update record).
                
                ### User Input:
                {question}
                
                ### Output:
                - Intent: [Your answer here]
                - Additional Details Required: [List any missing information]
            """),
            "data_collection": ChatPromptTemplate.from_template("""
                Based on the intent "{intent}", collect the following details:
                {missing_details}
                
                ### User Input:
                {question}
                
                ### Output:
                - Updated Details: [Your answer here]
                - Additional Details Required: [Your answer here]
            """),
            "query_generation": ChatPromptTemplate.from_template("""
                Using the following details:
                {collected_details}
                
                ### Generate an SQL query to execute the user's request:
                - SQL Query: [Your answer here]
            """),
        }


    def handle_request(self, user_input):
        logging.debug(f"Handling user input: {user_input}")
        step = self.session_state["step"]

        if step == 0:
            prompt = self.prompts["intent_identification"].format({
                "question": user_input,
            })
            response = self.llm.invoke(prompt)
            self.session_state["intent"] = response.get("Intent", "")
            self.session_state["missing_details"] = response.get("Additional Details Required", "")
            self.session_state["step"] += 1
            logging.info(f"Identified intent: {self.session_state['intent']}. Missing details: {self.session_state['missing_details']}")
            return f"Identified intent: {self.session_state['intent']}. Missing details: {self.session_state['missing_details']}"

        elif step == 1:
            prompt = self.prompts["data_collection"].format_map({
                "intent": self.session_state["intent"],
                "missing_details": self.session_state["missing_details"],
                "question": user_input,
            })
            response = self.llm.invoke(prompt)
            self.session_state["collected_details"].update(response.get("Updated Details", {}))
            self.session_state["missing_details"] = response.get("Additional Details Required", "")

            if not self.session_state["missing_details"]:
                self.session_state["step"] += 1
                logging.info(f"Collected details: {self.session_state['collected_details']}")
                return f"Collected details so far: {self.session_state['collected_details']}"

            logging.info(f"Updated details: {self.session_state['collected_details']}. Still need: {self.session_state['missing_details']}")
            return f"Updated details: {self.session_state['collected_details']}. Still need: {self.session_state['missing_details']}"

        elif step == 2:
            prompt = self.prompts["query_generation"].format_map({
                "collected_details": self.session_state["collected_details"],
            })
            response = self.llm.invoke(prompt)
            self.session_state["sql_query"] = response.get("SQL Query", "")
            result = self.execute_query(self.session_state["sql_query"])
            self.session_state["step"] = 0
            logging.info(f"SQL Query: {self.session_state['sql_query']}\nResult: {result}")
            return f"SQL Query: {self.session_state['sql_query']}\nResult: {result}"

    def execute_query(self, query):
        logging.debug(f"Executing SQL query: {query}")
        return self.db.run(query)

    def run_chatbot(self):
        logging.debug("Starting chatbot")
        print("Dental CRM Chatbot is now running. Type 'exit' to stop.")
        while True:
            user_input = input(":User  ")
            if user_input.lower() == "exit":
                logging.debug("Exiting chatbot")
                print("Exiting chatbot. Goodbye!")
                break
            try:
                response = self.handle_request(user_input)
                print(f"AI: {response}")
            except Exception as e:
                logging.error(f"Error processing request: {e}")
                print(f"AI: Sorry, I couldn't process your request due to an error: {e}")

# Initialize the chatbot
if __name__ == "__main__":
    db_path = str(here("data")) + "/db.sqlite3"
    api_key = "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"
    chatbot = DentalCRMChatbot(api_key, db_path)
    chatbot.run_chatbot()