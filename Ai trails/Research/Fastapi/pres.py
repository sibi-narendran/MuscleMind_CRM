from supabase import create_client
from datetime import datetime
from openai import OpenAI
from typing import Dict, List

class SupabaseManager:
    def __init__(self):
        self.supabase = create_client(
            supabase_url='https://ltxnbtvdxdtrobskpjsw.supabase.co',
            supabase_key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG5idHZkeGR0cm9ic2twanN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MzYyNzAsImV4cCI6MjA0NzMxMjI3MH0.814eiBys7Q_N1DrAyVJ2B2gs2Zgyf0VHZjSTsLPhlgY'
        )
        self.client = OpenAI(api_key='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')

    def generate_prescription(self, appointment_id: str):
        # Get appointment details
        appointment = self.get_appointment_details(appointment_id)
        if not appointment:
            raise ValueError(f"Appointment not found for ID: {appointment_id}")
        
        # Get medications for the treatment
        medications = self.get_medications(appointment['treatment_id'])
        
        # Prepare data for OpenAI
        prompt = self._create_prescription_prompt(appointment, medications)
        
        # Generate prescription using OpenAI
        prescription_text = self._generate_prescription_text(prompt)
        
        # Save prescription to database
        prescription_data = {
            'appointment_id': int(appointment_id),
            'patient_id': appointment['patient_id'],
            'patient_name': appointment['patient_name'],
            'age': appointment['age'],
            'gender': appointment['gender'],
            'treatment_name': appointment['treatment_name'],
            'prescription_text': prescription_text,
            'created_at': datetime.now().isoformat(),
            'user_id': appointment['user_id']
        }
        
        try:
            print("Saving prescription with data:", prescription_data)
            result = self.supabase.table('prescriptions').insert(prescription_data).execute()
            return result.data
        except Exception as e:
            print(f"Error saving prescription: {e}")
            return None

    def get_appointment_details(self, appointment_id: str) -> Dict:
        try:
            response = self.supabase.table('appointments')\
                .select('*')\
                .eq('id', appointment_id)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching appointment: {e}")
            return None

    def get_medications(self, treatment_id: str) -> List[Dict]:
        try:
            response = self.supabase.table('medications')\
                .select('*')\
                .eq('treatment_id', treatment_id)\
                .execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching medications: {e}")
            return []

    def _create_prescription_prompt(self, appointment: Dict, medications: List[Dict]) -> str:
        return f"""Generate a medical prescription with the following details:
        Patient: {appointment['patient_name']}
        Age: {appointment['age']}
        Gender: {appointment['gender']}
        Treatment: {appointment['treatment_name']}
        Date: {appointment.get('date', datetime.now().date())}
        
        Medications:
        {self._format_medications(medications)}
        
        Generate a professional medical prescription including dosage instructions and special notes."""

    def _format_medications(self, medications: List[Dict]) -> str:
        if not medications:
            return "No medications prescribed"
            
        formatted_meds = []
        for med in medications:
            formatted_meds.append(
                f"- {med.get('name', 'N/A')} ({med.get('brand', 'N/A')}) - {med.get('dosage', 'N/A')}\n"
                f"  Food Instructions: {med.get('foodInstructions', 'N/A')}\n"
                f"  Special Note: {med.get('specialNote', 'N/A')}\n"
                f"  Times: {med.get('times', 'N/A')}"
            )
        return "\n".join(formatted_meds)

    def _generate_prescription_text(self, prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a medical prescription generator. Generate clear and professional prescriptions based on the provided information."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating prescription text: {e}")
            return "Error generating prescription"

# Example usage
if __name__ == "__main__":
    try:
        database = SupabaseManager()
        prescription = database.generate_prescription("108")  # Use your actual appointment ID
        print("Generated prescription:", prescription)
    except Exception as e:
        print(f"Error in main: {e}")