from supabase import create_client
from datetime import datetime
from typing import Dict
import random
import string
import openai

class InvoiceGenerator:
    def __init__(self):
        self.supabase = create_client(
            supabase_url='https://ltxnbtvdxdtrobskpjsw.supabase.co',
            supabase_key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG5idHZkeGR0cm9ic2twanN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MzYyNzAsImV4cCI6MjA0NzMxMjI3MH0.814eiBys7Q_N1DrAyVJ2B2gs2Zgyf0VHZjSTsLPhlgY'
        )
        openai.api_key = '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'

    def generate_invoice_number(self) -> str:
        date_part = datetime.now().strftime('%Y%m%d')
        random_part = ''.join(random.choices(string.digits, k=4))
        return f"INV-{date_part}-{random_part}"

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

    def get_treatment_details(self, treatment_id: str) -> Dict:
        try:
            response = self.supabase.table('treatments')\
                .select('*')\
                .eq('treatment_id', treatment_id)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching treatment: {e}")
            return None

    def generate_invoice_description(self, appointment: Dict, treatment: Dict) -> str:
        prompt = f"""
        Generate a detailed invoice description for the following details:
        Patient Name: {appointment['patient_name']}
        Treatment: {treatment['procedure_name']}
        Cost: {treatment['cost']}
        Date: {appointment['date']}
        """
        try:
            response = openai.Completion.create(
                model="gpt-4o",
                prompt=prompt,
                max_tokens=150
            )
            return response.choices[0].text.strip()
        except Exception as e:
            print(f"Error generating invoice description: {e}")
            return "Error generating description"

    def generate_invoice(self, appointment_id: str):
        appointment = self.get_appointment_details(appointment_id)
        if not appointment:
            raise ValueError(f"Appointment not found for ID: {appointment_id}")
        
        treatment = self.get_treatment_details(appointment['treatment_id'])
        if not treatment:
            raise ValueError(f"Treatment not found for ID: {appointment['treatment_id']}")
        
        invoice_number = self.generate_invoice_number()
        invoice_description = self.generate_invoice_description(appointment, treatment)
        
        invoice_data = {
            'invoice_number': invoice_number,
            'user_id': appointment['user_id'],
            'patient_id': appointment['patient_id'],
            'patient_name': appointment['patient_name'],
            'treatment_id': treatment['treatment_id'],
            'treatment_name': appointment['treatment_name'],
            'cost': treatment['cost'],
            'invoice_status': 'PENDING',
            'appointment_id': appointment_id,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'description': invoice_description
        }
        
        try:
            print("Creating invoice with data:", invoice_data)
            result = self.supabase.table('billings').insert(invoice_data).execute()
            return result.data
        except Exception as e:
            print(f"Error creating invoice: {e}")
            return None

# Example usage
if __name__ == "__main__":
    try:
        invoice_gen = InvoiceGenerator()
        invoice = invoice_gen.generate_invoice("108")  # Use your actual appointment ID
        print("Generated invoice:", invoice)
    except Exception as e:
        print(f"Error in main: {e}")