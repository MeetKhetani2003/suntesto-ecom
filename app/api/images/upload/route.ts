import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// POST: Upload mockup package design and store in GridFS / Public fallbacks
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded.' }, { status: 400 });
    }

    // Validate is image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file must be a valid image format.' }, { status: 400 });
    }

    const { client, bucket } = await connectToDatabase();

    // Convert file arrayBuffer to node buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize original file name
    const sanitizedOriginalName = file.name.replace(/[^\w.-]/g, '_');
    const uniqueName = `mockup_${Date.now()}_${sanitizedOriginalName}`;

    // 1. Upload mockup to MongoDB GridFS
    const uploadStream = bucket.openUploadStream(uniqueName, {
      contentType: file.type || 'image/png'
    });
    
    await new Promise<void>((resolve, reject) => {
      uploadStream.write(buffer, (err?: any) => {
        if (err) reject(err);
      });
      uploadStream.end(() => {
        resolve();
      });
    });

    // 2. High-resilience Local Mock Database Fallback
    // If the MongoClient client is null, it means we are in persistent JSON fallback mode.
    // We write the image binary directly into the public/packagings folder so that
    // the GET streaming endpoint openDownloadStreamByName can read and stream it natively.
    if (!client) {
      const publicPackagingsDir = path.join(process.cwd(), 'public', 'packagings');
      
      if (!fs.existsSync(publicPackagingsDir)) {
        fs.mkdirSync(publicPackagingsDir, { recursive: true });
      }
      
      const localFilePath = path.join(publicPackagingsDir, uniqueName);
      fs.writeFileSync(localFilePath, buffer);
      console.log(`[Mock DB File Upload] Wrote mockup to local disk: ${uniqueName}`);
    }

    const imageUrl = `/api/images/${uniqueName}`;
    console.log(`[Mockup Uploaded] Saved mockup to e-commerce files: ${imageUrl}`);

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      filename: uniqueName
    });
  } catch (error) {
    console.error('Error uploading mockup:', error);
    return NextResponse.json({ error: 'Internal server mockup upload failure.' }, { status: 500 });
  }
}
