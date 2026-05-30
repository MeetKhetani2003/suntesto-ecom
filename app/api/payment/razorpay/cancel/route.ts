import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Razorpay Order ID is required for restock release.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find active reservation
    const reservation = await db.collection('reservations').findOne({ orderId, status: 'reserved' });

    if (!reservation) {
      return NextResponse.json({ 
        success: false, 
        message: 'No active reservation hold found or reservation already finalized/released.' 
      });
    }

    // Atomically restock all items back into active inventory
    for (const item of reservation.items) {
      await db.collection('products').updateOne(
        { id: item.id },
        {
          $inc: {
            stock: Number(item.quantity),
            reserved: -Number(item.quantity)
          }
        }
      );
    }

    // Mark reservation status as cancelled
    await db.collection('reservations').updateOne(
      { _id: reservation._id },
      { $set: { status: 'cancelled', restockedDate: new Date() } }
    );

    console.log(`[Inventory Restocked] Released lock hold for order: ${orderId}`);

    return NextResponse.json({
      success: true,
      message: 'Reserved stock successfully returned to active inventory.'
    });
  } catch (error) {
    console.error('Razorpay restock route error:', error);
    return NextResponse.json({ error: 'Internal database restocking failure.' }, { status: 500 });
  }
}
