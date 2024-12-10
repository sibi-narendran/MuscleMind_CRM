from typing import Dict, TypedDict
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from datetime import datetime
from enum import Enum
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from pyprojroot import here
from typing import Dict, Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from sqlalchemy import text


db_path = str(here("data")) + "/db.sqlite3"
db = SQLDatabase.from_uri(f"sqlite:///{db_path}")


def get_schema(_):
    return db.get_table_info()

class State(TypedDict):
    query: str
    intent: str
    response: str
    details: Dict

class Intent(Enum):
    NEW_APPOINTMENT = "new_appointment"
    RESCHEDULE_APPOINTMENT = "reschedule_appointment"
    CANCEL_APPOINTMENT = "cancel_appointment"
    VIEW_APPOINTMENTS = "view_appointments"
    PATIENT_DETAILS = "patient_details"
    CHECK_AVAILABILITY = "check_availability"
    OTHERS = "others"

def run_query(query):
        return db.run(query)

def detect_intent(state: State) -> State:
    """Detect the intent of the dental query"""
    prompt = ChatPromptTemplate.from_template(
        """Classify the following dental query into one of these categories:
        - new_appointment (if user wants to book a new appointment)
        - reschedule_appointment (if user wants to change existing appointment)
        - cancel_appointment (if user wants to cancel appointment)
        - view_appointments (if user wants to see their appointments)
        - patient_details (if query is about patient information)
        - check_availability (if asking about available slots)
        - others (if query is not related to dental services)

        Query: {query}
        
        Respond with only the category name."""
    )
    chain = prompt | ChatOpenAI(api_key="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",
            model="gpt-4",
            temperature=0.0)
    intent = chain.invoke({"query": state["query"]}).content.strip().lower()
    return {"intent": intent}

def handle_new_appointment(state: State) -> State:
    """Handle new appointment requests with database integration"""
    try:
        # Initial prompt to gather appointment information
        gather_info_prompt = ChatPromptTemplate.from_template(
            """Act as a dental receptionist. Collect necessary information for a new appointment.
            Ask ONE question at a time about:
            - Patient name
            - Preferred date
            - Preferred time
            - Type of dental service needed
            
            Current query: {query}
            Current details: {details}
            
            Respond conversationally and ask the next required piece of information."""
        )

        # Initialize LLM
        llm = ChatOpenAI(
            api_key="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",
            model="gpt-4",
            temperature=0.0
        )

        # Setup database
        db = SQLDatabase.from_uri("sqlite:///dental_crm.db")

        # Check if we have all required information
        details = state.get("details", {})
        required_fields = ["patient_name", "preferred_date", "preferred_time", "service_type"]
        missing_fields = [field for field in required_fields if field not in details]

        if missing_fields:
            # Create the chain for gathering information
            chain = gather_info_prompt | llm
            
            # Get response from the chain
            response = chain.invoke({
                "query": state["query"],
                "details": details
            })
            
            # Extract content from the response
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            return {"response": response_text, "details": details}

        else:
            # All information collected, proceed with database operations
            try:
                # Execute database operations
                with db.connect() as conn:
                    # Check if patient exists
                    result = conn.execute(text("""
                        SELECT id FROM patients WHERE name = :name
                    """), {"name": details["patient_name"]})
                    
                    patient = result.fetchone()
                    
                    if not patient:
                        # Insert new patient
                        result = conn.execute(text("""
                            INSERT INTO patients (name) VALUES (:name) RETURNING id
                        """), {"name": details["patient_name"]})
                        patient_id = result.fetchone()[0]
                    else:
                        patient_id = patient[0]
                    
                    # Insert appointment
                    conn.execute(text("""
                        INSERT INTO appointments 
                        (patient_id, date, time, treatment_type, status) 
                        VALUES 
                        (:patient_id, :date, :time, :treatment_type, 'scheduled')
                    """), {
                        "patient_id": patient_id,
                        "date": details["preferred_date"],
                        "time": details["preferred_time"],
                        "treatment_type": details["service_type"]
                    })
                    
                    conn.commit()

                response = f"""Great! I've scheduled your appointment:
                Patient: {details['patient_name']}
                Date: {details['preferred_date']}
                Time: {details['preferred_time']}
                Service: {details['service_type']}
                
                Your appointment has been confirmed. Please arrive 10 minutes early."""

                return {"response": response, "details": details}

            except Exception as e:
                error_msg = f"Error scheduling appointment: {str(e)}"
                print(error_msg)
                return {
                    "response": "I apologize, but I encountered an error while scheduling your appointment. Please try again.",
                    "error": error_msg
                }

    except Exception as e:
        error_msg = f"Error in appointment handling: {str(e)}"
        print(error_msg)
        return {
            "response": "I apologize, but I encountered an error. Please try again.",
            "error": error_msg
        }

def handle_reschedule(state: State) -> State:
    """Handle appointment rescheduling"""
    prompt = ChatPromptTemplate.from_template(
        """Act as a dental receptionist helping reschedule an appointment.
        Ask for:
        - Current appointment details (date/time)
        - Preferred new date/time
        
        Current query: {query}
        Current details: {details}
        
        Respond naturally and help reschedule the appointment."""
    )
    chain = prompt | ChatOpenAI(api_key="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",
            model="gpt-4",
            temperature=0.0)
    response = chain.invoke({
        "query": state["query"],
        "details": state.get("details", {})
    }).content
    return {"response": response}

def handle_cancellation(state: State) -> State:
    """Handle appointment cancellation"""
    prompt = ChatPromptTemplate.from_template(
        """Act as a dental receptionist handling an appointment cancellation.
        Ask for:
        - Appointment date/time to cancel
        - Reason for cancellation (optional)
        - Confirm cancellation
        
        Current query: {query}
        Current details: {details}
        
        Respond empathetically and process the cancellation request."""
    )
    chain = prompt | ChatOpenAI(api_key="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",
            model="gpt-4",
            temperature=0.0)
    response = chain.invoke({
        "query": state["query"],
        "details": state.get("details", {})
    }).content
    return {"response": response}

def handle_view_appointments(state: State) -> State:
    # Initial prompt to gather required information
    gather_info_prompt = ChatPromptTemplate.from_template(
        """Act as a dental receptionist helping view appointments.
        Ask for:
        - Patient name or ID
        - Time period (if needed)
        
        Current query: {query}
        Current details: {details}
        
        Help the patient view their appointment(s)."""
    )

    # SQL generation prompt
    sql_prompt = ChatPromptTemplate.from_template(
    """You are a dental receptionist. Generate a SQL query to view appointments.
    IMPORTANT: Use ? for parameter binding (DO NOT use {}).
    
    Example correct format:
    SELECT * FROM appointments WHERE patient_id = ?
    
    Tables:
    - core_appointment (id, patient_id, doctor_id, date, time, status)
    - core_patient (id, name, contact)
    - core_doctor (id, name)
    
    Query: {query}
    Details: {details}
    
    Return only the SQL query using ? for parameters."""

        )

    # Initialize LLM
    llm = ChatOpenAI(
        api_key="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",
        model="gpt-4",
        temperature=0.0
    )

    # Chain to gather information
    info_chain = gather_info_prompt | llm

    # Chain to generate and execute SQL query
    sql_generation_chain = (
        RunnablePassthrough.assign(schema=get_schema)
        | sql_prompt
        | llm.bind(stop="\nSQL Result:")
        | StrOutputParser()
    )

    # Final chain to format response
    response_chain = (
        RunnablePassthrough.assign(
            query=sql_generation_chain
        ).assign(
            schema=get_schema,
            response=lambda variables: run_query(variables["query"])
        )
        | gather_info_prompt
        | llm
    )

    # Execute the chain
    response = response_chain.invoke({
        "query": state["query"],
        "details": state.get("details", {})
    })

    return {"response": response.content}


def handle_patient_details(state: State) -> State:
    """Handle patient information requests"""
    prompt = ChatPromptTemplate.from_template(
        """Act as a dental receptionist managing patient information.
        For new patients, collect:
        - Full name
        - Date of birth
        - Contact number
        - Email
        - Address
        - Emergency contact
        
        For existing patients, verify identity before sharing information.
        
        Current query: {query}
        Current details: {details}
        
        Handle the patient information request professionally."""
    )
    chain = prompt | ChatOpenAI(api_key="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",
            model="gpt-4",
            temperature=0.0)
    response = chain.invoke({
        "query": state["query"],
        "details": state.get("details", {})
    }).content
    return {"response": response}

def handle_availability_check(state: State) -> State:
    """Handle availability checks"""
    prompt = ChatPromptTemplate.from_template(
        """Act as a dental receptionist checking appointment availability.
        Ask for:
        - Preferred date or date range
        - Preferred time of day (if any)
        - Type of appointment
        
        Current query: {query}
        Current details: {details}
        
        Help check available appointment slots."""
    )
    chain = prompt | ChatOpenAI(api_key="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",
            model="gpt-4",
            temperature=0.0)
    response = chain.invoke({
        "query": state["query"],
        "details": state.get("details", {})
    }).content
    return {"response": response}

def handle_others(state: State) -> State:
    """Handle non-dental queries with natural language responses"""
    
    prompt = ChatPromptTemplate.from_template(
        """You are a friendly and helpful dental clinic assistant. 
        The user has made a query that's not directly related to our dental services.
        
        Our services include:
        - Booking new appointments
        - Rescheduling appointments
        - Canceling appointments
        - Viewing appointments
        - Managing patient information
        - Checking appointment availability
        
        User query: {query}
        
        Please respond in a friendly, professional manner:
        1. Acknowledge their query politely
        2. Explain what services you can help with
        3. Invite them to ask about dental services
        
        Keep the response conversational and helpful."""
    )

    try:
        # Initialize LLM
        llm = ChatOpenAI(
            api_key="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",
            model="gpt-4",
            temperature=0.3 # Slightly higher temperature for more natural responses
        )

        # Create and execute the chain
        chain = prompt | llm

        # Get response
        response = chain.invoke({
            "query": state["query"]
        })

        return {
            "response": response.content,
            "details": state.get("details", {})
        }

    except Exception as e:
        print(f"Error in handling other queries: {str(e)}")
        # Fallback response in case of error
        fallback_response = """I apologize, but I'm having trouble understanding your request. 
        I'm here to help with dental-related services like appointments, scheduling, and patient information. 
        How can I assist you with your dental needs today?"""
        return {"response": fallback_response}

class DentalCRMBot:
    def __init__(self, api_key):
        self.handlers = {
            Intent.NEW_APPOINTMENT.value: handle_new_appointment,
            Intent.RESCHEDULE_APPOINTMENT.value: handle_reschedule,
            Intent.CANCEL_APPOINTMENT.value: handle_cancellation,
            Intent.VIEW_APPOINTMENTS.value: handle_view_appointments,
            Intent.PATIENT_DETAILS.value: handle_patient_details,
            Intent.CHECK_AVAILABILITY.value: handle_availability_check,
            Intent.OTHERS.value: handle_others
        }
        self.conversation_history = {}
        self.llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-4",
            temperature=0.0
        )

    def process_query(self, query: str, session_id: str = "default") -> str:
        """Process user query and return appropriate response"""
        # Initialize or get existing conversation state
        state = self.conversation_history.get(session_id, {
            "query": query,
            "intent": "",
            "response": "",
            "details": {}
        })
        
        # Update state with new query
        state["query"] = query
        
        # Detect intent if not in ongoing conversation
        if not state["intent"]:
            state.update(detect_intent(state))
        
        # Handle query based on intent
        handler = self.handlers.get(state["intent"], handle_others)
        state.update(handler(state))
        
        # Update conversation history
        self.conversation_history[session_id] = state
        
        return state["response"]

# Usage example:
if __name__ == "__main__":
    bot = DentalCRMBot(api_key="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")
    
    # Example conversation
    queries = [
        "I want to book a dental appointment",
        "I need to reschedule my appointment",
        "Can you check if Dr. Smith is available next Tuesday?",
        "What are my upcoming appointments?",
        "I want to cancel my appointment",
        "How do I make pizza?" # Non-dental query
    ]
    
    print("Dental Assistant: How can I help you today?")
    while True:
        user_input = input("\nUser: ")
        if user_input.lower() == "exit":
            break
        
        response = bot.process_query(user_input)
        print(f"\nAssistant: {response}")