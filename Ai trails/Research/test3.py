from typing import Dict, TypedDict
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from datetime import datetime
from enum import Enum
from enum import Enum
from langgraph.graph import StateGraph, END
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
    """Handle new appointment requests"""
    prompt = ChatPromptTemplate.from_template(
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
    chain = prompt | ChatOpenAI(api_key="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",
            model="gpt-4",
            temperature=0.0)
    response = chain.invoke({
        "query": state["query"],
        "details": state.get("details", {})
    }).content
    return {"response": response}

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
    """Handle viewing appointments"""
    prompt = ChatPromptTemplate.from_template(
        """Act as a dental receptionist helping view appointments.
        Ask for:
        - Patient name or ID
        - Time period (if needed)
        
        Current query: {query}
        Current details: {details}
        
        Help the patient view their appointment(s)."""
    )
    chain = prompt | ChatOpenAI(api_key="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",
            model="gpt-4",
            temperature=0.0)
    response = chain.invoke({
        "query": state["query"],
        "details": state.get("details", {})
    }).content
    return {"response": response}

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
    """Handle non-dental queries"""
    response = """I apologize, but I can only assist with dental-related queries such as:
    - Booking new appointments
    - Rescheduling appointments
    - Canceling appointments
    - Viewing your appointments
    - Managing patient information
    - Checking appointment availability
    
    Please let me know if you need help with any of these services."""
    return {"response": response}


class DentalCRMBot:
    def __init__(self, api_key):
        self.api_key = api_key
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
        self.workflow = self._create_workflow()

    def _create_workflow(self) -> StateGraph:
        """Create and return the workflow graph"""
        # Create the graph
        workflow = StateGraph(State)

        # Add nodes for intent detection and handling
        workflow.add_node("detect_intent", detect_intent)
        
        # Add nodes for each intent handler
        for intent_name, handler in self.handlers.items():
            workflow.add_node(intent_name, handler)

        # Add conditional edges from intent detection to handlers
        def route_intent(state: State) -> str:
            """Route to appropriate handler based on detected intent"""
            return state.get("intent", Intent.OTHERS.value)

        workflow.add_conditional_edges(
            "detect_intent",
            route_intent,
            {intent: intent for intent in self.handlers.keys()}
        )

        # Add edges from handlers to END
        for intent in self.handlers.keys():
            workflow.add_edge(intent, END)

        # Set entry point
        workflow.set_entry_point("detect_intent")

        # Compile the graph
        return workflow.compile()

    def process_query(self, query: str, session_id: str = "default") -> str:
        """Process user query through the workflow graph"""
        # Initialize state
        state = {
            "query": query,
            "intent": "",
            "response": "",
            "details": self.conversation_history.get(session_id, {})
        }

        # Process through workflow
        result = self.workflow.invoke(state)

        # Update conversation history
        self.conversation_history[session_id] = result.get("details", {})

        return result.get("response", "I apologize, but I couldn't process your request.")

    def run_interactive(self):
        """Run an interactive session with the bot"""
        print("Dental Assistant: How can I help you today?")
        session_id = datetime.now().strftime("%Y%m%d%H%M%S")
        
        while True:
            user_input = input("\nUser: ")
            if user_input.lower() == "exit":
                print("\nDental Assistant: Thank you for using our service. Have a great day!")
                break
            
            response = self.process_query(user_input, session_id)
            print(f"\nAssistant: {response}")


# Usage example:
if __name__ == "__main__":
    api_key = "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"
    bot = DentalCRMBot(api_key)
    bot.run_interactive()