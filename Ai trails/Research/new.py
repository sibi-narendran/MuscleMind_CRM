from langchain_openai import ChatOpenAI
from langchain.chains import create_sql_query_chain
from langchain.schema import HumanMessage, SystemMessage
from langchain_community.utilities import SQLDatabase
from datetime import datetime, timedelta
import json

class DentalAssistant:
    def __init__(self, api_key):
        # Initialize LLM first
        self.llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-4",
            temperature=0.0
        )
        
        # Database connection
        self.db = SQLDatabase.from_uri("sqlite:///dental_clinic.db")
        
        # Initialize SQL Chain
        self.sql_chain = create_sql_query_chain(self.llm, self.db)
        
        # Initialize context
        self.context = {}
        
        # Initialize tables if they don't exist
        self._initialize_database()
        
        # Add patient fields
        self.patient_fields = {
            "name": "Full name",
            "age": "Age",
            "phone": "Phone number",
            "email": "Email address",
            "address": "Home address",
            "medical_history": "Any medical conditions we should know about"
        }
        
        # Add procedure durations (in minutes)
        self.procedure_durations = {
            "cleaning": 30,
            "checkup": 30,
            "filling": 60,
            "crown": 90,
            "extraction": 45,
            "root canal": 120
        }
        
        self.valid_intents = [
            "new appointment",
            "cancel appointment",
            "reschedule appointment",
            "patient details",
            "view appointments",
            "others"
        ]

    def _initialize_database(self):
        """Create necessary tables if they don't exist"""
        create_patients_table = """
        CREATE TABLE IF NOT EXISTS core_patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            phone TEXT,
            email TEXT,
            address TEXT,
            medical_history TEXT
        );
        """
        
        create_appointments_table = """
        CREATE TABLE IF NOT EXISTS core_appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            procedure_type TEXT NOT NULL,
            duration INTEGER,
            FOREIGN KEY (patient_name) REFERENCES core_patients(name)
        );
        """
        
        self.db.run(create_patients_table)
        self.db.run(create_appointments_table)

    def get_llm_response(self, system_prompt, user_prompt):
        """Helper method to get LLM response"""
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        response = self.llm.invoke(messages)
        return response.content

    def classify_intent(self, user_input):
        """Classify user intent"""
        system_prompt = """
        You are a dental clinic assistant. Classify the intent into one of these categories:
        - new appointment
        - cancel appointment
        - reschedule appointment
        - patient details
        - view appointments
        - others
        """
        user_prompt = f"Classify this user input: '{user_input}'"
        intent = self.get_llm_response(system_prompt, user_prompt).lower().strip()
        return intent if intent in self.valid_intents else "others"

    def extract_information(self, user_input):
        """Extract relevant information from user input"""
        system_prompt = """
        Extract specific information from the user input for a dental clinic.
        Return a JSON object with any of these fields if found:
        - patient_name
        - date (DD/MM/YYYY)
        - time (HH:MM AM/PM)
        - procedure_type (cleaning/checkup/filling/crown/extraction/root canal)
        Only include fields that are explicitly mentioned.
        """
        try:
            response = self.get_llm_response(system_prompt, user_input)
            return json.loads(response)
        except:
            return {}

    def get_next_question(self, intent):
        """Determine next required information"""
        required_fields = {
            "new appointment": [
                ("patient_name", "What is the patient's name?"),
                ("date", "What date would you prefer? (DD/MM/YYYY)"),
                ("time", "What time would you prefer? (HH:MM AM/PM)"),
                ("procedure_type", "What type of procedure? (cleaning/checkup/filling/crown/extraction/root canal)")
            ],
            "cancel appointment": [
                ("patient_name", "What is the patient's name?"),
                ("date", "What is the appointment date to cancel? (DD/MM/YYYY)")
            ],
            # Add other intents as needed
        }
        
        fields = required_fields.get(intent, [])
        for field, question in fields:
            if field not in self.context:
                return field, question
        return None, None

    def verify_patient(self, patient_name):
        """Check if patient exists"""
        query = f"""
        SELECT name, phone, email 
        FROM core_patients 
        WHERE name LIKE '%{patient_name}%'
        """
        return self.db.run(query)

    def collect_patient_info(self):
        """Collect new patient information"""
        patient_info = {}
        for field, description in self.patient_fields.items():
            response = input(f"Please enter patient's {description}: ")
            patient_info[field] = response
        return patient_info

    def check_availability(self, date, time, procedure_type):
        """Check appointment availability"""
        duration = self.procedure_durations.get(procedure_type.lower(), 30)
        # Mock implementation - always returns available
        return True, duration

    def process_user_input(self, user_input):
        """Process user input and manage conversation flow"""
        try:
            # Classify intent if not already set
            if "intent" not in self.context:
                self.context["intent"] = self.classify_intent(user_input)
                return f"I understand you want to {self.context['intent']}. How can I help?"

            # Extract information from input
            extracted_info = self.extract_information(user_input)
            self.context.update(extracted_info)

            # Verify patient if name is provided
            if "patient_name" in self.context and "patient_verified" not in self.context:
                existing_patients = self.verify_patient(self.context["patient_name"])
                if not existing_patients:
                    response = input("Patient not found. Register as new patient? (yes/no): ")
                    if response.lower() == "yes":
                        self.context.update(self.collect_patient_info())
                        # Here you would insert the new patient into database
                    else:
                        return "Please provide an existing patient name."
                self.context["patient_verified"] = True

            # Get next required information
            next_field, next_question = self.get_next_question(self.context["intent"])
            if next_question:
                return next_question

            # Process complete information
            return self.execute_intent()

        except Exception as e:
            return f"Error: {str(e)}"

    def execute_intent(self):
        """Execute the intent with collected information"""
        intent = self.context["intent"]
        if intent == "new appointment":
            # Add appointment to database
            query = f"""
            INSERT INTO core_appointments (patient_name, appointment_date, appointment_time, procedure_type, duration)
            VALUES (
                '{self.context["patient_name"]}',
                '{self.context["date"]}',
                '{self.context["time"]}',
                '{self.context["procedure_type"]}',
                {self.procedure_durations[self.context["procedure_type"].lower()]}
            )
            """
            self.db.run(query)
            return f"""
            Appointment confirmed:
            Patient: {self.context["patient_name"]}
            Date: {self.context["date"]}
            Time: {self.context["time"]}
            Procedure: {self.context["procedure_type"]}
            """
        
        return "Operation completed successfully"

# Example usage
if __name__ == "__main__":
    api_key = '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'  # Replace with your API key
    assistant = DentalAssistant(api_key)
    
    print("Dental Assistant: How can I help you today?")
    while True:
        user_input = input("User: ")
        if user_input.lower() == "exit":
            break
        
        response = assistant.process_user_input(user_input)
        print(f"Assistant: {response}")