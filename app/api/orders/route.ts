import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

// Helper: compact single-page A4 PDF invoice
function generateInvoicePdfBuffer(order: any, customerEmail: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', compress: true });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = 515; // usable width (595 - 40*2)
      const LEFT = 40;

      // ── Brand Header ──────────────────────────────────────────────────────
      doc.rect(LEFT, 30, W, 52).fill('#111111');
      doc.fillColor('#EFEFEA').fontSize(18).font('Helvetica-Bold')
         .text('SUSTENTO ORGANICS', LEFT + 12, 38);
      doc.fontSize(7).font('Helvetica').fillColor('#999999')
         .text('FREEZE-DRIED ORGANIC SNACKING  •  TAX INVOICE', LEFT + 12, 60);

      // Invoice number top-right
      doc.fillColor('#EFEFEA').fontSize(8).font('Helvetica-Bold')
         .text(`INV# ${order.id}`, LEFT, 38, { width: W - 12, align: 'right' });
      doc.fillColor('#999999').fontSize(7).font('Helvetica')
         .text(`Date: ${order.date}`, LEFT, 60, { width: W - 12, align: 'right' });

      // ── Bill To / Details row ─────────────────────────────────────────────
      const infoY = 96;
      doc.fillColor('#111111').fontSize(7).font('Helvetica-Bold').text('BILLED TO:', LEFT, infoY);
      doc.font('Helvetica').fillColor('#333333').text(customerEmail, LEFT, infoY + 10);
      doc.text('Delivery: Standard Free Shipping', LEFT, infoY + 20);

      doc.fillColor('#111111').font('Helvetica-Bold').text('STATUS:', LEFT + 310, infoY);
      doc.font('Helvetica').fillColor('#059669')
         .text('PAID — RAZORPAY VERIFIED', LEFT + 310, infoY + 10);

      // ── Thin divider ──────────────────────────────────────────────────────
      const divY = infoY + 36;
      doc.strokeColor('#dddddd').lineWidth(0.5).moveTo(LEFT, divY).lineTo(LEFT + W, divY).stroke();

      // ── Table header ──────────────────────────────────────────────────────
      const TH = divY + 8;
      doc.rect(LEFT, TH, W, 16).fill('#f5f5f3');
      doc.fillColor('#111111').fontSize(7).font('Helvetica-Bold')
         .text('PRODUCT', LEFT + 4, TH + 4)
         .text('QTY',     LEFT + 280, TH + 4)
         .text('UNIT',    LEFT + 340, TH + 4)
         .text('TOTAL',   LEFT + 440, TH + 4);

      // ── Table rows ────────────────────────────────────────────────────────
      let rowY = TH + 18;
      const ROW_H = 16;
      order.items.forEach((item: any, i: number) => {
        if (i % 2 === 0) { doc.rect(LEFT, rowY, W, ROW_H).fill('#fafafa'); }
        const lineTotal = (Number(item.price) * Number(item.quantity)).toFixed(2);
        doc.fillColor('#111111').fontSize(8).font('Helvetica')
           .text(String(item.name).toUpperCase(), LEFT + 4, rowY + 4, { width: 260, ellipsis: true })
           .text(String(item.quantity),            LEFT + 280, rowY + 4)
           .text('₹' + Number(item.price).toFixed(2),          LEFT + 340, rowY + 4)
           .text('₹' + lineTotal,                  LEFT + 440, rowY + 4);
        rowY += ROW_H;
      });

      // ── Totals block ──────────────────────────────────────────────────────
      const postRowY = rowY + 6;
      doc.strokeColor('#111111').lineWidth(0.8)
         .moveTo(LEFT, postRowY).lineTo(LEFT + W, postRowY).stroke();

      const shipping = 0;
      const grandTotal = Number(order.total);

      const totX = LEFT + 330;
      doc.fillColor('#555555').fontSize(7.5).font('Helvetica-Bold')
         .text('SHIPPING:', totX, postRowY + 8);
      doc.fillColor('#111111').font('Helvetica')
         .text('FREE',      totX + 120, postRowY + 8, { width: 70, align: 'right' });

      doc.fillColor('#111111').fontSize(9).font('Helvetica-Bold')
         .text('GRAND TOTAL (INR):', totX, postRowY + 22);
      doc.rect(totX, postRowY + 18, W - 330, 16).fill('#111111');
      doc.fillColor('#EFEFEA').fontSize(9).font('Helvetica-Bold')
         .text('₹' + grandTotal.toFixed(2), totX + 2, postRowY + 21, { width: W - 332, align: 'right' });

      // ── Footer ────────────────────────────────────────────────────────────
      const footY = postRowY + 46;
      doc.strokeColor('#eeeeee').lineWidth(0.5)
         .moveTo(LEFT, footY).lineTo(LEFT + W, footY).stroke();
      doc.fillColor('#aaaaaa').fontSize(7).font('Helvetica-Oblique')
         .text(
           'Thank you for choosing Sustento Organics! For support: hello@sustento.com  •  This is a computer-generated invoice.',
           LEFT, footY + 6, { width: W, align: 'center' }
         );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// GET: Retrieve order history for the logged-in user or list all orders for administrative purposes
export async function GET(request: NextRequest) {
  try {
    const sessionEmail = request.cookies.get('sustento-session')?.value;
    
    if (!sessionEmail) {
      return NextResponse.json({ error: 'Unauthenticated session' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Check if requester is Admin (e.g. hello@sustento.com or specific emails) or standard user
    // We fetch all orders if it's the admin querying a list, but let's check for "isAdmin" parameter
    const isAdmin = request.nextUrl.searchParams.get('admin') === 'true';
    let orders;
    
    if (isAdmin) {
      orders = await db
        .collection('orders')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    } else {
      orders = await db
        .collection('orders')
        .find({ email: sessionEmail.toLowerCase() })
        .sort({ createdAt: -1 })
        .toArray();
    }

    const formattedOrders = orders.map((o: any) => ({
      id: o.id,
      date: o.date,
      total: o.total,
      status: o.status || 'Pending',
      items: o.items,
      email: o.email,
      // delivery tracking fields (populated when shipped)
      trackingNumber: o.trackingNumber || null,
      carrier: o.carrier || null,
      estimatedDelivery: o.estimatedDelivery || null,
      statusHistory: o.statusHistory || []
    }));

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return NextResponse.json({ error: 'Internal order retrieval failure' }, { status: 500 });
  }
}

// POST: Persist a new order for the logged-in user & handle atomic inventory clearance
export async function POST(request: NextRequest) {
  try {
    const sessionEmail = request.cookies.get('sustento-session')?.value;
    
    if (!sessionEmail) {
      return NextResponse.json({ error: 'Unauthenticated session' }, { status: 401 });
    }

    const body = await request.json();
    const { id, total, items } = body;

    if (!id || !total || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid order structure' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // 1. QUANTITY MANAGEMENT: Atomically release the hold and transition reservations
    const reservation = await db.collection('reservations').findOne({ orderId: id, status: 'reserved' });
    
    if (reservation) {
      console.log(`[Order Completion] Found active reservation for ${id}. Clearing hold counts.`);
      // Decrement the "reserved" count, leaving the stock permanently subtracted!
      for (const item of reservation.items) {
        await db.collection('products').updateOne(
          { id: item.id },
          {
            $inc: {
              reserved: -Number(item.quantity)
            }
          }
        );
      }
      
      // Update reservation status to confirmed
      await db.collection('reservations').updateOne(
        { _id: reservation._id },
        { $set: { status: 'confirmed', confirmedDate: new Date() } }
      );
    } else {
      console.warn(`[Order Completion] No active reservation found for order ${id}. Bypassing hold clearance and decrementing stock directly.`);
      // If no reservation hold found (e.g. session timed out or admin direct checkout), deduct from stock directly to keep catalog inventory integrity
      for (const item of items) {
        await db.collection('products').updateOne(
          { id: item.id },
          {
            $inc: {
              stock: -Number(item.quantity)
            }
          }
        );
      }
    }
    
    // 2. CREATE NEW ORDER RECORD
    const orderDateString = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    const newOrder = {
      id,
      email: sessionEmail.toLowerCase(),
      date: orderDateString,
      total: Number(total),
      status: 'Pending',
      trackingNumber: null,
      carrier: null,
      estimatedDelivery: null,
      statusHistory: [{ status: 'Pending', timestamp: new Date().toISOString() }],
      items: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image,
        color: item.color
      })),
      createdAt: new Date()
    };

    await db.collection('orders').insertOne(newOrder);
    console.log(`[Order Created] Registered order ${id} for customer ${sessionEmail}`);

    // 3. COMPILE AND EMAIL PDF INVOICE
    const transportUser = process.env.EMAIL_USER;
    const transportPass = process.env.EMAIL_PASS;

    if (transportUser && transportPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: transportUser,
            pass: transportPass,
          },
        });

        // Compile PDF Invoice Buffer
        const pdfBuffer = await generateInvoicePdfBuffer(newOrder, sessionEmail);

        // Draft premium HTML email body
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eaeaea; border-radius: 24px; background-color: #F7F7F5; color: #111111;">
            <div style="text-align: center; border-bottom: 2px solid #111111; padding-bottom: 20px; margin-bottom: 30px;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase;">SUSTENTO ORGANICS</h2>
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #888888; letter-spacing: 0.15em;">Your Invoice is Ready</span>
            </div>
            
            <p style="font-size: 14px; font-weight: 300; line-height: 1.6;">
              Dear Snacker,
            </p>
            <p style="font-size: 14px; font-weight: 300; line-height: 1.6;">
              Thank you for purchasing clean organic freeze-dried fruits from Sustento! Your transaction was processed successfully. 
            </p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #eaeaea; margin-top: 24px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-transform: uppercase;">
                <tbody>
                  <tr>
                    <td style="padding: 6px 0; color: #888888; font-weight: bold; width: 40%;">Order Reference</td>
                    <td style="padding: 6px 0; color: #111111; font-weight: 900; font-family: monospace;">${id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #888888; font-weight: bold;">Date</td>
                    <td style="padding: 6px 0; color: #111111; font-weight: bold;">${orderDateString}</td>
                  </tr>
                  <tr style="border-top: 1px solid #eaeaea;">
                    <td style="padding: 10px 0; color: #888888; font-weight: bold;">Total Amount</td>
                    <td style="padding: 10px 0; color: #111111; font-weight: 900; font-size: 14px;">$${Number(total).toFixed(2)} USD</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style="font-size: 13px; font-weight: 300; line-height: 1.6; color: #666666;">
              We have compiled and attached your official **A4 PDF Invoice** to this email. You can view, download, or print it directly from your email application at your convenience.
            </p>

            <div style="text-align: center; border-top: 1px solid #eaeaea; padding-top: 20px; margin-top: 32px; font-size: 10px; color: #aaaaaa; letter-spacing: 0.05em; font-weight: bold;">
              SUSTENTO E-COMMERCE LOGISTICS DEPT • HELLO@SUSTENTO.COM
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Sustento Logistics" <${transportUser}>`,
          to: sessionEmail,
          subject: `📦 Sustento E-Commerce Order Invoice - ${id}`,
          html: emailHtml,
          attachments: [
            {
              filename: `invoice_${id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });
        console.log(`[Invoice Dispatched] PDF Invoice successfully emailed to ${sessionEmail}`);
      } catch (mailErr) {
        console.error('[Mail Exception] Failed to compile or transmit invoice PDF:', mailErr);
      }
    } else {
      console.warn('[Mail Blocked] Nodemailer credentials are missing in your environment. Email dispatch skipped.');
    }

    return NextResponse.json({ success: true, message: 'Order persisted and PDF invoice emailed successfully' });
  } catch (error) {
    console.error('Error saving new order:', error);
    return NextResponse.json({ error: 'Internal order persistence failure' }, { status: 500 });
  }
}

// PATCH: Update order status and tracking info (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, trackingNumber, carrier, estimatedDelivery } = body;

    const VALID_STATUSES = ['Pending', 'Packed', 'Shipped', 'Delivered'];
    if (!id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (status) updateFields.status = status;
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber;
    if (carrier !== undefined) updateFields.carrier = carrier;
    if (estimatedDelivery !== undefined) updateFields.estimatedDelivery = estimatedDelivery;

    // Append to statusHistory array
    const historyEntry = { status: status || 'updated', timestamp: new Date().toISOString() };

    await db.collection('orders').updateOne(
      { id },
      {
        $set: updateFields,
        $push: { statusHistory: historyEntry } as any
      }
    );

    console.log(`[Order Updated] Order ${id} → status: ${status}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal order update failure' }, { status: 500 });
  }
}
