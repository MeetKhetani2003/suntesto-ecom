import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectToDatabase } from '@/lib/db';

// GET: Retrieve all contact inquiries (useful for Admin Panel)
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Retrieve all contact inquiries, sorted by latest first
    const inquiries = await db
      .collection('contact_inquiries')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
      
    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    return NextResponse.json({ error: 'Internal contact retrieval failure' }, { status: 500 });
  }
}

// POST: Persist a new standard contact inquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, reason } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required parameters (Name, Email, Message)' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const newInquiry = {
      name,
      email: email.toLowerCase().trim(),
      reason: reason || 'General Inquiry',
      message,
      createdAt: new Date()
    };

    await db.collection('contact_inquiries').insertOne(newInquiry);
    console.log(`[Contact Logged] Saved inquiry from ${name} (${email})`);

    // Setup NodeMailer secure transporter using Gmail SMTP
    const transportUser = process.env.EMAIL_USER;
    const transportPass = process.env.EMAIL_PASS;

    if (transportUser && transportPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: transportUser,
          pass: transportPass,
        },
      });

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 16px; background-color: #F7F7F5;">
          <div style="text-align: center; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #111; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 900;">Sustento Support</h2>
            <span style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; letter-spacing: 0.2em;">New Contact Inquiry Received</span>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tbody>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase; width: 40%;">Sender Name</td>
                <td style="padding: 10px 0; font-weight: bold; color: #111; font-size: 14px;">${name}</td>
              </tr>
              <tr style="border-top: 1px solid #eaeaea;">
                <td style="padding: 10px 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase;">Email Address</td>
                <td style="padding: 10px 0; font-weight: bold; color: #111; font-size: 14px;"><a href="mailto:${email}" style="color: #ca8a04; text-decoration: none;">${email}</a></td>
              </tr>
              <tr style="border-top: 1px solid #eaeaea;">
                <td style="padding: 10px 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase;">Inquiry Reason</td>
                <td style="padding: 10px 0; font-weight: bold; color: #111; font-size: 14px;">
                  <span style="background-color: #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 9999px; font-size: 11px;">${newInquiry.reason}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eaeaea; margin-bottom: 24px;">
            <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.1em;">Message</h4>
            <p style="margin: 0; font-size: 13px; color: #444; line-height: 1.6; font-style: italic;">"${message}"</p>
          </div>

          <div style="text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eaeaea; padding-top: 16px; margin-top: 24px;">
            This inquiry was sent securely via Sustento E-Commerce platform API.
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"${name} (Sustento Contact)" <${transportUser}>`,
        to: transportUser,
        subject: `🚨 Sustento Contact Inquiry - ${name}`,
        html: htmlContent,
        replyTo: email
      });
      console.log(`[Email Dispatched] Contact inquiry from ${name} sent via Nodemailer.`);
    }

    return NextResponse.json({ success: true, message: 'Message logged and emailed successfully!' });
  } catch (error) {
    console.error('Error saving contact inquiry:', error);
    return NextResponse.json({ error: 'Internal contact persistence failure' }, { status: 500 });
  }
}
