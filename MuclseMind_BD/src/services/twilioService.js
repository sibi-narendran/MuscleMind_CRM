const twilio = require('twilio');
const moment = require('moment');

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendAppointmentNotification = async (appointmentData) => {
  try {
    const {
      patientName,
      patientPhone,
      doctorName,
      doctorPhone,
      appointmentDate,
      appointmentTime,
      type
    } = appointmentData;

    console.log('Sending notification for:', {
      patientName,
      patientPhone,
      doctorName,
      doctorPhone,
      appointmentDate,
      appointmentTime,
      type
    });

    // Format date and time for the message
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = new Date(`2000-01-01T${appointmentTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    // Patient message
    const patientMessage = type === 'SCHEDULED' 
      ? `🦷 *Appointment Confirmation - ${appointmentData.clinic_name}*\n\nDear ${patientName},\n\nYour dental appointment has been scheduled:\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\n👨‍⚕️ Doctor: Dr. ${doctorName}\n\nPlease arrive 10 minutes early. If you need to reschedule, please contact us 24 hours in advance.\n\nThank you for choosing us!`
      : type === 'CANCELLED'
      ? `🦷 *Appointment Cancellation*\n\nDear ${patientName},\n\nYour appointment with Dr. ${doctorName} for ${formattedDate} at ${formattedTime} has been cancelled.`
      : `🦷 *Appointment Update*\n\nDear ${patientName},\n\nYour appointment with Dr. ${doctorName} for ${formattedDate} at ${formattedTime} has been updated.`;

    // Doctor message
    const doctorMessage = type === 'SCHEDULED'
      ? `🦷 *New Appointment Alert*\n\nDear Dr. ${doctorName},\n\nA new appointment has been scheduled:\n👤 Patient: ${patientName}\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}`
      : type === 'CANCELLED'
      ? `🦷 *Appointment Cancellation Alert*\n\nDear Dr. ${doctorName},\n\nThe appointment with ${patientName} for ${formattedDate} at ${formattedTime} has been cancelled.`
      : `🦷 *Appointment Update Alert*\n\nDear Dr. ${doctorName},\n\nThe appointment with ${patientName} for ${formattedDate} at ${formattedTime} has been updated.`;

    const results = {
      patient: { sms: false, whatsapp: false },
      doctor: { sms: false, whatsapp: false }
    };

    // Send SMS to patient
    if (patientPhone) {
      try {
        const patientSMS = await client.messages.create({
          body: patientMessage,
          to: patientPhone,
          from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log('Patient SMS sent:', patientSMS.sid);
        results.patient.sms = true;
      } catch (error) {
        console.error('Error sending patient SMS:', error.message);
      }

      // Send WhatsApp to patient
      try {
        const patientWhatsApp = await client.messages.create({
          body: patientMessage,
          to: `whatsapp:${patientPhone}`,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
        });
        console.log('Patient WhatsApp sent:', patientWhatsApp.sid);
        results.patient.whatsapp = true;
      } catch (error) {
        console.error('Error sending patient WhatsApp:', error.message);
      }
    }

    // Send SMS to doctor
    if (doctorPhone) {
      try {
        const doctorSMS = await client.messages.create({
          body: doctorMessage,
          to: doctorPhone,
          from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log('Doctor SMS sent:', doctorSMS.sid);
        results.doctor.sms = true;
      } catch (error) {
        console.error('Error sending doctor SMS:', error.message);
      }

      // Send WhatsApp to doctor
      try {
        const doctorWhatsApp = await client.messages.create({
          body: doctorMessage,
          to: `whatsapp:${doctorPhone}`,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
        });
        console.log('Doctor WhatsApp sent:', doctorWhatsApp.sid);
        results.doctor.whatsapp = true;
      } catch (error) {
        console.error('Error sending doctor WhatsApp:', error.message);
      }
    }

    console.log('📊 Notification Summary:', {
      patient: results.patient,
      doctor: results.doctor
    });

    return results;
  } catch (error) {
    console.error('Error in sendAppointmentNotification:', error);
    throw error;
  }
};

module.exports = { sendAppointmentNotification }; 