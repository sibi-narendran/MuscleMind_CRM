from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from supabase import create_client
from openai import OpenAI
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["192.168.1.7"],  # Replace with your React app's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class PrescriptionRequest(BaseModel):
    appointment_id: str

class PrescriptionResponse(BaseModel):
    success: bool
    prescription: Optional[dict] = None
    error: Optional[str] = None

class SupabaseManager:
    def __init__(self):
        self.supabase = create_client(
            supabase_url='https://ltxnbtvdxdtrobskpjsw.supabase.co',
            supabase_key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG5idHZkeGR0cm9ic2twanN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MzYyNzAsImV4cCI6MjA0NzMxMjI3MH0.814eiBys7Q_N1DrAyVJ2B2gs2Zgyf0VHZjSTsLPhlgY'
        )
        self.client = OpenAI(api_key='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')

    async def get_appointment_details(self, appointment_id: str):
        try:
            response = self.supabase.table('appointments')\
                .select('*')\
                .eq('id', appointment_id)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching appointment: {str(e)}")

    async def get_medications(self, user_id: str):
        try:
            response = self.supabase.table('medications')\
                .select('*')\
                .eq('user_id', user_id)\
                .execute()
            return response.data if response.data else []
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching medications: {str(e)}")

    def _create_prescription_prompt(self, appointment, medications):
        return f"""Generate a medical prescription with the following details:
        Patient: {appointment['patient_name']}
        Age: {appointment['age']}
        Gender: {appointment['gender']}
        Treatment: {appointment['treatment_name']}
        Date: {appointment.get('date', datetime.now().date())}
        
        Medications:
        {self._format_medications(medications)}
        
        Generate a professional medical prescription including dosage instructions and special notes."""

    def _format_medications(self, medications):
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

    async def generate_prescription(self, appointment_id: str):
        try:
            # Get appointment details
            appointment = await self.get_appointment_details(appointment_id)
            if not appointment:
                raise HTTPException(status_code=404, detail="Appointment not found")
            
            # Get medications
            medications = await self.get_medications(appointment['user_id'])
            
            # Generate prescription using OpenAI
            prompt = self._create_prescription_prompt(appointment, medications)
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a medical prescription generator. Generate clear and professional prescriptions based on the provided information."},
                    {"role": "user", "content": prompt}
                ]
            )
            prescription_text = response.choices[0].message.content

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

            result = self.supabase.table('prescriptions').insert(prescription_data).execute()
            return result.data[0] if result.data else None

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# Initialize SupabaseManager
db_manager = SupabaseManager()

# FastAPI endpoint
@app.post("/generate-prescription", response_model=PrescriptionResponse)
async def generate_prescription(request: PrescriptionRequest):
    try:
        prescription = await db_manager.generate_prescription(request.appointment_id)
        return PrescriptionResponse(success=True, prescription=prescription)
    except HTTPException as e:
        return PrescriptionResponse(success=False, error=e.detail)
    except Exception as e:
        return PrescriptionResponse(success=False, error=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)