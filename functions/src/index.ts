/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from "firebase-functions/v2/https";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sgMail from "@sendgrid/mail";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize SendGrid with API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const sendEmailToAttendees = functions.https.onCall(async (data, context) => {
  // Verify the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to send emails');
  }

  const { recipients, subject, content, eventDetails, senderName } = data;

  try {
    const msg = {
      to: recipients,
      from: {
        email: 'events@tritonthenix.com',
        name: 'TritonThenix Events'
      },
      subject: subject,
      text: content,
      html: `
        <div>
          <p>${content}</p>
          <br/>
          <p><strong>Event Details:</strong></p>
          <p>Name: ${eventDetails.name}</p>
          <p>Date: ${eventDetails.date}</p>
          <p>Time: ${eventDetails.time}</p>
          <p>Sent by: ${senderName}</p>
        </div>
      `
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Error sending email');
  }
});
