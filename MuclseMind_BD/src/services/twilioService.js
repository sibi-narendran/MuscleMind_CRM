const twilio = require('twilio');
const moment = require('moment');

const sendAppointmentNotification = async (appointmentData, type = 'SCHEDULED') => {
  try {
    console.log('Starting notification process for:', {
      type,
      patient: appointmentData.patient_name,
      doctor: appointmentData.care_person
    });

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const formattedDate = moment(appointmentData.date).format('MMMM DD, YYYY');
    const formattedTime = moment(appointmentData.time, 'HH:mm').format('hh:mm A');

    const messages = {
      SCHEDULED: {
        patient: `
🦷 *Appointment Confirmation - ${appointmentData.clinic_name}*

Dear ${appointmentData.patient_name},

Your dental appointment has been scheduled:
📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
👨‍⚕️ Doctor: Dr. ${appointmentData.care_person}
🏥 Treatment: ${appointmentData.treatment_name}

Location: ${appointmentData.clinic_name}
📞 Clinic Contact: ${appointmentData.clinic_phone}

Please arrive 10 minutes early. If you need to reschedule, please contact us 24 hours in advance.

Thank you for choosing us!`,

        doctor: `
🦷 *New Appointment Alert*

Dear Dr. ${appointmentData.care_person},

A new appointment has been scheduled:
👤 Patient: ${appointmentData.patient_name}
📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
🏥 Treatment: ${appointmentData.treatment_name}
📞 Patient Contact: ${appointmentData.patient_phone}

Location: ${appointmentData.clinic_name}`
      },

      CANCELLED: {
        patient: `
🦷 *Appointment Cancellation - ${appointmentData.clinic_name}*

Dear ${appointmentData.patient_name},

Your appointment scheduled for:
📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
👨‍⚕️ Doctor: Dr. ${appointmentData.care_person}

Has been cancelled. Please contact ${appointmentData.clinic_phone} to reschedule.

Thank you for your understanding.`,

        doctor: `
🦷 *Appointment Cancellation Alert*

Dear Dr. ${appointmentData.care_person},

The following appointment has been cancelled:
👤 Patient: ${appointmentData.patient_name}
📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
🏥 Treatment: ${appointmentData.treatment_name}`
      },

      COMPLETED: {
        patient: `
🦷 *Thank You - ${appointmentData.clinic_name}*

Dear ${appointmentData.patient_name},

Thank you for visiting us today. Your appointment with Dr. ${appointmentData.care_person} has been completed.

For any post-treatment queries, please contact us:
📞 ${appointmentData.clinic_phone}

We appreciate your trust in our care!`,

        doctor: `
🦷 *Appointment Completed*

Dear Dr. ${appointmentData.care_person},

Appointment completed for:
👤 Patient: ${appointmentData.patient_name}
📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
🏥 Treatment: ${appointmentData.treatment_name}`
      }
    };

    const notifications = [];
    const notificationResults = {
      patient: { sms: null, whatsapp: null },
      doctor: { sms: null, whatsapp: null }
    };

    // Send notifications to patient
    if (appointmentData.patient_phone) {
      console.log('Sending notifications to patient:', appointmentData.patient_phone);

      // SMS to patient
      try {
        const patientSMS = await client.messages.create({
          body: messages[type].patient,
          to: appointmentData.patient_phone,
          from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log('✅ Patient SMS sent:', patientSMS.sid);
      } catch (error) {
        console.error('❌ Patient SMS failed:', error.message);
      }

      // WhatsApp to patient
      try {
        const patientWhatsApp = await client.messages.create({
          body: messages[type].patient,
          to: `whatsapp:${appointmentData.patient_phone}`,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
        });
        console.log('✅ Patient WhatsApp sent:', patientWhatsApp.sid);
      } catch (error) {
        console.error('❌ Patient WhatsApp failed:', error.message);
      }
    }

    // Send notifications to doctor
    if (appointmentData.doctor_phone) {
      console.log('Sending notifications to doctor:', appointmentData.doctor_phone);

      // SMS to doctor
      try {
        const doctorSMS = await client.messages.create({
          body: messages[type].doctor,
          to: appointmentData.doctor_phone,
          from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log('✅ Doctor SMS sent:', doctorSMS.sid);
      } catch (error) {
        console.error('❌ Doctor SMS failed:', error.message);
      }

      // WhatsApp to doctor
      try {
        const doctorWhatsApp = await client.messages.create({
          body: messages[type].doctor,
          to: `whatsapp:${appointmentData.doctor_phone}`,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
        });
        console.log('✅ Doctor WhatsApp sent:', doctorWhatsApp.sid);
      } catch (error) {
        console.error('❌ Doctor WhatsApp failed:', error.message);
      }
    }

    // Log final results
    console.log('\n📊 Notification Summary:');
    console.log('Patient Notifications:', {
      sms: notificationResults.patient.sms ? '✅ Sent' : '❌ Failed',
      whatsapp: notificationResults.patient.whatsapp ? '✅ Sent' : '❌ Failed'
    });
    console.log('Doctor Notifications:', {
      sms: notificationResults.doctor.sms ? '✅ Sent' : '❌ Failed',
      whatsapp: notificationResults.doctor.whatsapp ? '✅ Sent' : '❌ Failed'
    });

    // Return detailed results
    return {
      success: true,
      message: 'Notifications processed',
      results: notificationResults
    };

  } catch (error) {
    console.error('❌ Fatal error in notification service:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

module.exports = { sendAppointmentNotification }; 