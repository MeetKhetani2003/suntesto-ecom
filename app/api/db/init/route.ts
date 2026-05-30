import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { PRODUCTS } from '@/lib/data';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { db, bucket } = await connectToDatabase();
    
    // 1. Sync local images from public/packagings into GridFS
    const packagingsDir = path.join(process.cwd(), 'public', 'packagings');
    
    if (fs.existsSync(packagingsDir)) {
      const files = fs.readdirSync(packagingsDir);
      
      for (const filename of files) {
        // Skip hidden files
        if (filename.startsWith('.')) continue;
        
        const filePath = path.join(packagingsDir, filename);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          // Check if file already exists in GridFS
          const existing = await bucket.find({ filename }).toArray();
          
          if (existing.length === 0) {
            console.log(`Seeding local image into GridFS: ${filename}`);
            const fileBuffer = fs.readFileSync(filePath);
            const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
            
            const uploadStream = bucket.openUploadStream(filename, {
              contentType
            } as any);
            
            uploadStream.write(fileBuffer);
            uploadStream.end();
          }
        }
      }
    }

    // 2. Map original products list to GridFS routes & insert into Database
    const dbProducts = PRODUCTS.map(p => {
      const imageName = p.image.split('/').pop() as string;
      const dbImage = `/api/images/${imageName}`;
      
      const dbGallery = p.gallery.map(img => {
        const gallName = img.split('/').pop() as string;
        return `/api/images/${gallName}`;
      });

      return {
        ...p,
        image: dbImage,
        gallery: dbGallery,
        stock: p.stock !== undefined ? p.stock : 100,
        reserved: p.reserved !== undefined ? p.reserved : 0
      };
    });

    const productsCollection = db.collection('products');
    await productsCollection.deleteMany({});
    const result = await productsCollection.insertMany(dbProducts);

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully!',
      seededImagesCount: (await bucket.find({}).toArray()).length,
      seededProductsCount: result.insertedCount
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database seeding error'
    }, { status: 500 });
  }
}
