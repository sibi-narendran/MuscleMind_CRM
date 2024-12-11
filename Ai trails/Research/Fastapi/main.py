from supabase import create_client

class SupabaseManager:
    def __init__(self):
        self.supabase = create_client(
            supabase_url='https://ltxnbtvdxdtrobskpjsw.supabase.co',
            supabase_key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG5idHZkeGR0cm9ic2twanN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MzYyNzAsImV4cCI6MjA0NzMxMjI3MH0.814eiBys7Q_N1DrAyVJ2B2gs2Zgyf0VHZjSTsLPhlgY'
        )

    def get_patient(self, patient_id):
        return self.supabase.table('patients').select('*').eq('id', patient_id).execute()

    def create_appointment(self, appointment_data):
        return self.supabase.table('appointments').insert(appointment_data).execute()
    
database = SupabaseManager()
print(database.get_patient('2dfeca11-a8f2-4cbb-9fb6-254cf501cdb1'))