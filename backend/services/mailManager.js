// backend/services/mailManager.js
import dotenv from "dotenv";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import path from "path";

dotenv.config()


// Initialize MailerSend with your API key
const mailerSend = new MailerSend({
    apiKey: process.env.MAIL_TOKEN, // Make sure this is your Send-Email token
});

// Set your verified sender
const FROM_EMAIL = "noreply@neocode.work";
const FROM_NAME = "NeoCode";

export async function sendEmail(to, subject, html) {
    try {
        const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);

        const recipients = [new Recipient(to)];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject(subject)
            .setHtml(html)
            .setText("This is a plain-text fallback for email clients");

        const response = await mailerSend.email.send(emailParams);
        console.log("Email sent! ID:", response.id); // logs MailerSend email ID
        return true;
    } catch (err) {
        console.error("MailerSend error:", err);
        return false;
    }
}