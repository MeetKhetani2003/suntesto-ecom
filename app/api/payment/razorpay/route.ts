import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, items } = body;

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Valid payment amount is required.' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Checkout items ledger is required for inventory validation.' }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay configuration credentials are missing.' }, { status: 500 });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // 1. SELF-CLEANING MECHANISM: Release and restock any expired reservations (> 10 mins old)
    try {
      const now = new Date();
      const expiredHolds = await db
        .collection('reservations')
        .find({ expiresAt: { $lt: now }, status: 'reserved' })
        .toArray();

      for (const hold of expiredHolds) {
        for (const item of hold.items) {
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
        await db.collection('reservations').updateOne(
          { _id: hold._id },
          { $set: { status: 'expired_restocked', updatedDate: new Date() } }
        );
      }
    } catch (cleanError) {
      console.error('Self-cleaning reservation system error:', cleanError);
    }

    // 2. STOCK AVAILABILITY CHECK: Verify active stock holds for all cart items
    for (const item of items) {
      const product = await db.collection('products').findOne({ id: item.id });
      if (!product) {
        return NextResponse.json({ error: `Product "${item.id}" not found in catalog.` }, { status: 404 });
      }
      
      const availableStock = product.stock !== undefined ? Number(product.stock) : 100;
      if (availableStock < Number(item.quantity)) {
        return NextResponse.json({ 
          error: `Product "${product.name}" is understocked. Available inventory: ${availableStock}.` 
        }, { status: 400 });
      }
    }

    // 3. GENERATE OFFICIAL RAZORPAY ORDER ID
    // Convert USD to INR (approx 1 USD = 83 INR) and then to Paise (1 INR = 100 Paise)
    const usdToInrRate = 83;
    const amountInPaise = Math.round(amount * usdToInrRate * 100);
    const receiptId = `receipt_order_${Math.floor(100000 + Math.random() * 900000)}`;

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay API order error:', errorText);
      return NextResponse.json({ error: 'Razorpay order creation failed.' }, { status: 500 });
    }

    const orderData = await razorpayResponse.json();
    const orderId = orderData.id;

    // 4. ATOMIC QUANTITY LOCK: Decrement active stock, increment reserved count
    for (const item of items) {
      await db.collection('products').updateOne(
        { id: item.id },
        {
          $inc: {
            stock: -Number(item.quantity),
            reserved: Number(item.quantity)
          }
        }
      );
    }

    // 5. LOG RESERVATION HOLD
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes lock hold
    await db.collection('reservations').insertOne({
      orderId,
      items: items.map((item: any) => ({
        id: item.id,
        quantity: Number(item.quantity)
      })),
      expiresAt,
      status: 'reserved',
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      usdAmount: amount
    });
  } catch (error) {
    console.error('Razorpay order route error:', error);
    return NextResponse.json({ error: 'Internal payment gateway error.' }, { status: 500 });
  }
}
