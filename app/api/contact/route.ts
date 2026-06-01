import { NextRequest, NextResponse } from 'next/server';
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

    return NextResponse.json({ success: true, message: 'Message logged in database successfully!' });
  } catch (error) {
    console.error('Error saving contact inquiry:', error);
    return NextResponse.json({ error: 'Internal contact persistence failure' }, { status: 500 });
  }
}
