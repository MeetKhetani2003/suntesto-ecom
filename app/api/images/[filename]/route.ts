import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const { bucket } = await connectToDatabase();
    
    const decodedFilename = decodeURIComponent(filename);
    const files = await bucket.find({ filename: decodedFilename }).toArray();
    
    if (!files || files.length === 0) {
      return new NextResponse('Image not found in GridFS', { status: 404 });
    }

    const file = files[0];
    const downloadStream = bucket.openDownloadStreamByName(decodedFilename);

    const readableStream = new ReadableStream({
      start(controller) {
        downloadStream.on('data', (chunk: any) => controller.enqueue(chunk));
        downloadStream.on('end', () => controller.close());
        downloadStream.on('error', (err: any) => controller.error(err));
      }
    });

    const contentType = (file as any).contentType || 'image/png';
    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image from GridFS:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
