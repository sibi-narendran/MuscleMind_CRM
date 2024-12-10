from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pyprojroot import here
from datetime import datetime, timedelta
import json
from langchain.schema import SystemMessage, HumanMessage
import calendar

class DentalAssistant:
    def __init__(self, api_key):
        self.llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-4",
            temperature=0.0
        )
        
        self.db_path = str(here("data")) + "/db.sqlite3"
        self.db = SQLDatabase.from_uri(f"sqlite:///{self.db_path}")
        self.sql_chain = self._setup_sql_chain()
        self.context = {}
        self.valid_intents = [
            "new appointment",
            "cancel appointment",
            "reschedule appointment",
            "patient details",
            "view appointments",
            "others"
        ]

    def _setup_sql_chain(self):
        """Setup the SQL Chain with proper prompting"""
        template = """
        Based on the table schema below, write a SQL query that would answer the following request:
        {schema}

        Context: {context}
        Request: {query}

        Return only the SQL query without any explanation.
        """
        
        prompt = ChatPromptTemplate.from_template(template)
        
        def get_schema(_):
            return self.db.get_table_info()
        
        return (
            RunnablePassthrough.assign(schema=get_schema)
            | prompt
            | self.llm.bind(stop="\nSQL Result:")
            | StrOutputParser()
        )

    def reset_context(self):
        """Reset the context for new interaction"""
        self.context = {}
        print("Context reset. Ready for new query.")

    def process_user_input(self, user_input):
        """Process user input and manage conversation flow"""
        try:
            # If we have a completed operation, reset for new query
            if self.context.get("operation_completed"):
                self.reset_context()
                self.context["intent"] = self.classify_intent(user_input)
                return f"I understand you want to {self.context['intent']}. How can I help?"

            # Normal flow for ongoing interaction
            if "intent" not in self.context:
                self.context["intent"] = self.classify_intent(user_input)
                return f"I understand you want to {self.context['intent']}. How can I help?"

            # Extract information from input
            extracted_info = self.extract_information(user_input)
            self.context.update(extracted_info)

            # Get next required information
            next_field, next_question = self.get_next_question(self.context["intent"])
            if next_question:
                return next_question

            # All information collected, execute the intent
            result = self.execute_intent()
            
            # Mark operation as completed
            self.context["operation_completed"] = True
            return result

        except Exception as e:
            self.reset_context()  # Reset on error
            return f"Error: {str(e)}"

    def parse_natural_date(self, date_text):
        """Convert natural language date to DD/MM/YYYY format"""
        today = datetime.now()
        date_text = date_text.lower().strip()

        try:
            if date_text == "today":
                return today.strftime("%d/%m/%Y")
            
            elif date_text == "tomorrow":
                tomorrow = today + timedelta(days=1)
                return tomorrow.strftime("%d/%m/%Y")
            
            elif "next" in date_text:
                # Handle "next monday", "next tuesday", etc.
                day_name = date_text.replace("next ", "").strip()
                day_mapping = {day.lower(): i for i, day in enumerate(calendar.day_name)}
                
                if day_name in day_mapping:
                    current_day = today.weekday()
                    target_day = day_mapping[day_name]
                    days_ahead = target_day - current_day
                    
                    if days_ahead <= 0:  # Target day has passed this week
                        days_ahead += 7
                    
                    target_date = today + timedelta(days=days_ahead)
                    return target_date.strftime("%d/%m/%Y")
            
            # If it's already in DD/MM/YYYY format, validate and return
            elif len(date_text.split('/')) == 3:
                datetime.strptime(date_text, "%d/%m/%Y")
                return date_text
                
            return None
        except:
            return None

    def extract_information(self, user_input):
        """Extract relevant information from user input using OpenAI"""
        system_prompt = """
        Extract specific information from the user input for a dental clinic.
        Return a JSON object with any of these fields if found:
        - patient_name
        - date (convert any date reference to DD/MM/YYYY format)
        - time (HH:MM AM/PM)
        - procedure_type (cleaning/checkup/filling/crown/extraction/root canal)
        Only include fields that are explicitly mentioned.
        """
        
        try:
            response = self.get_llm_response(system_prompt, user_input)
            extracted_info = json.loads(response)
            
            # Handle natural language dates
            if 'date' in extracted_info:
                parsed_date = self.parse_natural_date(extracted_info['date'])
                if parsed_date:
                    extracted_info['date'] = parsed_date
                else:
                    del extracted_info['date']  # Remove invalid date
            
            return extracted_info
            
        except json.JSONDecodeError:
            print("Error parsing JSON response")
            return {}
        except Exception as e:
            print(f"Error extracting information: {str(e)}")
            return {}

    def get_next_question(self, intent):
        """Determine the next required information based on intent and context"""
        required_fields = {
            "new appointment": [
                ("patient_name", "What is the patient's name? (Example: John Smith)"),
                ("date", "What date would you prefer? (You can say 'today', 'tomorrow', or 'next monday')"),
                ("time", "What time would you prefer? (Example: 2:30 PM)"),
                ("procedure_type", "What type of procedure? (cleaning/checkup/filling/crown/extraction/root canal)")
            ],
            "cancel appointment": [
                ("patient_name", "What is the patient's name?"),
                ("date", "What is the appointment date you want to cancel? (Format: DD/MM/YYYY)")
            ],
            "reschedule appointment": [
                ("patient_name", "What is the patient's name?"),
                ("old_date", "What is the current appointment date? (Format: DD/MM/YYYY)"),
                ("new_date", "What is the new preferred date? (Format: DD/MM/YYYY)"),
                ("new_time", "What is the new preferred time? (Example: 2:30 PM)")
            ],
            "patient details": [
                ("patient_name", "What is the patient's name?")
            ],
            "view appointments": [
                ("patient_name", "What is the patient's name?")
            ]
        }

        fields = required_fields.get(intent, [])
        for field, question in fields:
            if field not in self.context:
                return field, question
        return None, None

    def execute_intent(self):
        """Execute the intent with SQL Chain generated query"""
        intent = self.context["intent"]
        
        # Generate SQL query
        sql_query = self.generate_sql_query(intent, self.context)
        if not sql_query:
            self.reset_context()
            return "Sorry, I couldn't generate a valid query for your request."
        
        print(f"\nGenerated SQL Query: {sql_query}\n")  # Debug print
        
        try:
            # Execute the query
            result = self.db.run(sql_query)
            
            # Format response based on intent
            if intent == "new appointment":
                return f"""
                Appointment confirmed:
                Patient: {self.context["patient_name"]}
                Date: {self.context["date"]}
                Time: {self.context["time"]}
                Procedure: {self.context["procedure_type"]}
                
                What else can I help you with?
                """
            elif intent == "view appointments":
                return f"""
                Appointments for {self.context['patient_name']}:
                {result}
                
                What else can I help you with?
                """
            else:
                return f"""
                Operation completed successfully: {result}
                
                What else can I help you with?
                """
                
        except Exception as e:
            self.reset_context()
            return f"Error executing query: {str(e)}"

    def generate_sql_query(self, intent, context):
        """Generate SQL query using the SQL Chain"""
        query_templates = {
            "new appointment": """
                Insert a new appointment with:
                Patient: {patient_name}
                Date: {date}
                Time: {time}
                Procedure: {procedure_type}
            """,
            "view appointments": "Find all appointments for patient {patient_name}",
            "cancel appointment": "Delete appointment for {patient_name} on {date}",
        }
        
        template = query_templates.get(intent, str(context))
        query_text = template.format(**context)
        
        try:
            sql_query = self.sql_chain.invoke({
                "query": query_text,
                "context": json.dumps(context)
            })
            
            # Validate generated query
            validation_prompt = f"Validate this SQL query for {intent}: {sql_query}"
            validation = self.llm.invoke(validation_prompt).content.strip().upper()
            
            if "YES" in validation:
                return sql_query
            return None
                
        except Exception as e:
            print(f"Error generating SQL: {str(e)}")
            return None

    def classify_intent(self, user_input):
        """Classify user intent using OpenAI"""
        system_prompt = """
        You are a dental clinic assistant. Your task is to classify user intents.
        Respond with ONLY ONE of these exact categories:
        - new appointment
        - cancel appointment
        - reschedule appointment
        - patient details
        - view appointments
        - others
        """
        
        user_prompt = f"Classify this user input: '{user_input}'"
        
        try:
            intent = self.get_llm_response(system_prompt, user_prompt).lower().strip()
            return intent if intent in self.valid_intents else "others"
        except Exception as e:
            print(f"Error classifying intent: {str(e)}")
            return "others"

    def get_llm_response(self, system_prompt, user_prompt):
        """Helper method to get LLM response with system and user prompts"""
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        response = self.llm.invoke(messages)
        return response.content

    

# Example usage
if __name__ == "__main__":
    api_key = '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'
    assistant = DentalAssistant(api_key)
    
    print("Dental Assistant: How can I help you today?")
    while True:
        user_input = input("\nUser: ")
        if user_input.lower() == "exit":
            break
        
        response = assistant.process_user_input(user_input)
        print(f"\nAssistant: {response}")