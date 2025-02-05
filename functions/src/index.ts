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

export const sendEventEmail = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    // Get data from the request
    const { recipients, subject, content, eventDetails } = request.data;

    console.log('Received email request:', {
      recipientCount: recipients?.length,
      subject,
      eventName: eventDetails?.name
    });

    // Validate required data
    if (!recipients?.length || !subject || !content || !eventDetails) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields'
      );
    }

    // Get API key from Firebase config
    const apiKey = process.env.SENDGRID_API_KEY || functions.config().sendgrid.key;
    if (!apiKey) {
      console.error('SendGrid API key missing');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'SendGrid API key not configured'
      );
    }

    // Initialize SendGrid
    sgMail.setApiKey(apiKey);
    console.log('SendGrid initialized');

    try {
      // Send email
      const result = await sgMail.send({
        to: recipients,
        from: {
          email: 'events@tritonthenix.com',
          name: 'TritonThenix Events'
        },
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <p>${content}</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <h3>Event Details:</h3>
              <p><strong>${eventDetails.name}</strong></p>
              <p>Date: ${eventDetails.date}</p>
              <p>Time: ${eventDetails.time}</p>
              <p>Message sent by: ${eventDetails.sentBy}</p>
            </div>
          </div>
        `
      });

      console.log('Email sent successfully:', result);
      return { success: true };

    } catch (sendGridError) {
      console.error('SendGrid error:', sendGridError);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send email through SendGrid'
      );
    }
  } catch (error) {
    console.error('Function error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'An unknown error occurred'
    );
  }
});
