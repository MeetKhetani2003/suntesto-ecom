import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify session
    const sessionEmail = request.cookies.get('sustento-session')?.value;
    
    if (!sessionEmail) {
      return NextResponse.json({ error: 'Unauthenticated session. Please sign in.' }, { status: 401 });
    }

    // 2. Read parameters
    const body = await request.json();
    const { name, email, organization, quantity, message } = body;

    if (!name || !email || !quantity) {
      return NextResponse.json({ error: 'Missing required inquiry parameters' }, { status: 400 });
    }

    // 2.5 Log wholesale inquiry in database for Admin Panel tracking
    try {
      const { db } = await connectToDatabase();
      await db.collection('bulk_inquiries').insertOne({
        name,
        email: email.toLowerCase().trim(),
        organization: organization || 'N/A',
        quantity: quantity,
        message: message || '',
        sessionEmail: sessionEmail.toLowerCase(),
        createdAt: new Date()
      });
      console.log(`[Bulk Inquiry Saved] Logged wholesale lead from ${name} (${email}) in MongoDB.`);
    } catch (dbErr) {
      console.error('Failed to log bulk inquiry in database:', dbErr);
    }

    // 3. Set up NodeMailer secure transporter using Gmail SMTP
    const transportUser = process.env.EMAIL_USER;
    const transportPass = process.env.EMAIL_PASS;

    if (!transportUser || !transportPass) {
      return NextResponse.json({ error: 'Nodemailer configuration is missing in .env.local' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: transportUser,
        pass: transportPass,
      },
    });

    // 4. Draft Wholesale Inquiry HTML Email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 16px; background-color: #F7F7F5;">
        <div style="text-align: center; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #111; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 900;">Sustento Wholesale</h2>
          <span style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; letter-spacing: 0.2em;">New Bulk Inquiry Received</span>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tbody>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase; width: 40%;">Sender Name</td>
              <td style="padding: 10px 0; font-weight: bold; color: #111; font-size: 14px;">${name}</td>
            </tr>
            <tr style="border-top: 1px solid #eaeaea;">
              <td style="padding: 10px 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase;">Company Email</td>
              <td style="padding: 10px 0; font-weight: bold; color: #111; font-size: 14px;"><a href="mailto:${email}" style="color: #ca8a04; text-decoration: none;">${email}</a></td>
            </tr>
            <tr style="border-top: 1px solid #eaeaea;">
              <td style="padding: 10px 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase;">Organization</td>
              <td style="padding: 10px 0; font-weight: bold; color: #111; font-size: 14px;">${organization || 'N/A'}</td>
            </tr>
            <tr style="border-top: 1px solid #eaeaea;">
              <td style="padding: 10px 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase;">Target Volume</td>
              <td style="padding: 10px 0; font-weight: bold; color: #111; font-size: 14px;">${quantity}</td>
            </tr>
            <tr style="border-top: 1px solid #eaeaea;">
              <td style="padding: 10px 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase;">Logged In User</td>
              <td style="padding: 10px 0; font-weight: bold; color: #888; font-size: 13px;">${sessionEmail.toLowerCase()}</td>
            </tr>
          </tbody>
        </table>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eaeaea; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.1em;">Special Requirements & Message</h4>
          <p style="margin: 0; font-size: 13px; color: #444; line-height: 1.6; font-style: italic;">"${message || 'No additional custom specs provided.'}"</p>
        </div>

        <div style="text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eaeaea; padding-top: 16px; margin-top: 24px;">
          This inquiry was sent securely via Sustento E-Commerce platform API.
        </div>
      </div>
    `;

    // 5. Send SMTP email using the shared account
    await transporter.sendMail({
      from: `"${name} (Sustento Bulk)" <${transportUser}>`,
      to: transportUser, // Send wholesale inquiry to meetkhetani1111@gmail.com
      subject: `🚨 Sustento Bulk Inquiry - ${organization || name}`,
      html: htmlContent,
      replyTo: email
    });

    return NextResponse.json({ success: true, message: 'Nodemailer SMTP inquiry email dispatched successfully!' });
  } catch (error) {
    console.error('Nodemailer SMTP wholesale delivery failure:', error);
    return NextResponse.json({ error: 'Nodemailer wholesale dispatch failure' }, { status: 500 });
  }
}

// GET: Retrieve all wholesale inquiries (useful for Admin Panel)
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Retrieve all wholesale inquiries, sorted by latest first
    const inquiries = await db
      .collection('bulk_inquiries')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
      
    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error('Error fetching bulk inquiries:', error);
    return NextResponse.json({ error: 'Internal bulk inquiry retrieval failure' }, { status: 500 });
  }
}
