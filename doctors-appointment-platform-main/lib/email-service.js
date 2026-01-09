import transporter from './email-config.js';
import { format } from 'date-fns';

/**
 * Send appointment confirmation email to patient
 */
export async function sendAppointmentConfirmationEmail({
  patientEmail,
  patientName,
  doctorName,
  doctorSpecialty,
  appointmentDate,
  appointmentTime,
  appointmentId
}) {
  const subject = `Appointment Confirmed - Dr. ${doctorName}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #4F46E5; }
        .value { color: #333; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        .button { background: #4F46E5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🩺 Appointment Confirmed</h1>
        </div>

        <div class="content">
          <h2>Hello ${patientName}!</h2>
          <p>Your appointment has been successfully booked. Here are your appointment details:</p>

          <div class="appointment-card">
            <h3>📋 Appointment Details</h3>
            <div class="detail-row">
              <span class="label">Doctor:</span>
              <span class="value">Dr. ${doctorName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Specialty:</span>
              <span class="value">${doctorSpecialty}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${appointmentDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${appointmentTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Appointment ID:</span>
              <span class="value">${appointmentId}</span>
            </div>
          </div>

          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please join the video call 5 minutes before your scheduled time</li>
            <li>Ensure you have a stable internet connection</li>
            <li>Have your medical history and current medications ready</li>
            <li>You can cancel or reschedule up to 1 hour before your appointment</li>
          </ul>

          <p>You can manage your appointments and join the video call from your patient dashboard.</p>

          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Doctors Appointment Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textTemplate = `
    Appointment Confirmation

    Hello ${patientName}!

    Your appointment has been successfully booked.

    Appointment Details:
    - Doctor: Dr. ${doctorName}
    - Specialty: ${doctorSpecialty}
    - Date: ${appointmentDate}
    - Time: ${appointmentTime}
    - Appointment ID: ${appointmentId}

    Important Notes:
    - Please join the video call 5 minutes before your scheduled time
    - Ensure you have a stable internet connection
    - Have your medical history and current medications ready
    - You can cancel or reschedule up to 1 hour before your appointment

    You can manage your appointments from your patient dashboard.

    © ${new Date().getFullYear()} Doctors Appointment Platform. All rights reserved.
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Doctors Appointment Platform" <${process.env.SENDER_EMAIL}>`,
      to: patientEmail,
      subject: subject,
      text: textTemplate,
      html: htmlTemplate,
    });

    console.log('✅ Appointment confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send appointment confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send appointment notification email to doctor
 */
export async function sendDoctorNotificationEmail({
  doctorEmail,
  doctorName,
  patientName,
  appointmentDate,
  appointmentTime,
  appointmentId,
  patientDescription
}) {
  const subject = `New Appointment Booked - ${patientName}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Appointment Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #059669; }
        .value { color: #333; }
        .description { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🩺 New Appointment Booked</h1>
        </div>

        <div class="content">
          <h2>Hello Dr. ${doctorName}!</h2>
          <p>A new appointment has been booked with you. Here are the details:</p>

          <div class="appointment-card">
            <h3>📋 Appointment Details</h3>
            <div class="detail-row">
              <span class="label">Patient:</span>
              <span class="value">${patientName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${appointmentDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${appointmentTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Appointment ID:</span>
              <span class="value">${appointmentId}</span>
            </div>

            ${patientDescription ? `
            <div class="description">
              <h4>Patient Description:</h4>
              <p>${patientDescription}</p>
            </div>
            ` : ''}
          </div>

          <p>You can view more details and manage this appointment from your doctor dashboard.</p>

          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Doctors Appointment Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Doctors Appointment Platform" <${process.env.SENDER_EMAIL}>`,
      to: doctorEmail,
      subject: subject,
      html: htmlTemplate,
    });

    console.log('✅ Doctor notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send doctor notification email:', error);
    return { success: false, error: error.message };
  }
}