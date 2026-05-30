import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionEmail = request.cookies.get('sustento-session')?.value;
    
    if (!sessionEmail) {
      return NextResponse.json({ authenticated: false, message: 'Unauthenticated session' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: sessionEmail.toLowerCase() });

    if (!user) {
      return NextResponse.json({ authenticated: false, message: 'User record not found' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        picture: user.picture || '',
        phone: user.phone || '',
        address: user.address || '',
        tier: user.tier || 'Standard Member',
        joined: user.joined || 'January 2025'
      }
    });
  } catch (error) {
    console.error('Error in auth check endpoint:', error);
    return NextResponse.json({ error: 'Internal auth synchronization error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionEmail = request.cookies.get('sustento-session')?.value;
    
    if (!sessionEmail) {
      return NextResponse.json({ error: 'Unauthenticated session' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, address } = body;

    const { db } = await connectToDatabase();
    
    // Update contact phone and address persistently
    await db.collection('users').updateOne(
      { email: sessionEmail.toLowerCase() },
      {
        $set: {
          phone: phone || '',
          address: address || '',
          updatedAt: new Date()
        }
      }
    );

    // Fetch and return the updated user record
    const user = await db.collection('users').findOne({ email: sessionEmail.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        picture: user.picture || '',
        phone: user.phone || '',
        address: user.address || '',
        tier: user.tier || 'Standard Member',
        joined: user.joined || 'January 2025'
      }
    });
  } catch (error) {
    console.error('Error in auth update endpoint:', error);
    return NextResponse.json({ error: 'Internal profile update failure' }, { status: 500 });
  }
}

