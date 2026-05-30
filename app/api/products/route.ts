import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { PRODUCTS } from '@/lib/data';

// GET: Retrieve all products dynamically from MongoDB with real-time stock levels
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch all products
    const dbProducts = await db.collection('products').find({}).toArray();
    
    // If the database is completely empty (not yet seeded), fall back to standard PRODUCTS list
    if (dbProducts.length === 0) {
      return NextResponse.json({ success: true, products: PRODUCTS });
    }
    
    return NextResponse.json({ success: true, products: dbProducts });
  } catch (error) {
    console.error('Error fetching dynamic products:', error);
    return NextResponse.json({ error: 'Internal products retrieval failure' }, { status: 500 });
  }
}

// PUT: Update an existing product by its slug id
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    // Cast numeric fields
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.originalPrice !== undefined) updates.originalPrice = Number(updates.originalPrice);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    updates.updatedAt = new Date();
    await db.collection('products').updateOne({ id }, { $set: updates });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal product update failure' }, { status: 500 });
  }
}

// DELETE: Remove a product by its slug id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    await db.collection('products').deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal product deletion failure' }, { status: 500 });
  }
}

// POST: Add a new dynamic product to the catalog (restricted to Admin actions)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      price, 
      originalPrice, 
      category, 
      desc, 
      color, 
      darkColor,
      image, 
      stock, 
      calories, 
      sugar, 
      shelfLife, 
      ingredients, 
      origin 
    } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Missing required product parameters (Name, Price, Category)' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Construct safe slugified ID
    const productSlug = name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '') // remove non-word chars
      .replace(/[\s_-]+/g, '-')  // replace spaces/hyphens with a single hyphen
      .replace(/^-+|-+$/g, '');  // trim hyphens

    // Check if product slug ID already exists to avoid collisions
    const existing = await db.collection('products').findOne({ id: productSlug });
    const finalSlug = existing ? `${productSlug}-${Math.floor(100 + Math.random() * 900)}` : productSlug;

    // Use selected packaging or fallback
    const finalImage = image || '/api/images/main_hero.png';

    const newProduct = {
      id: finalSlug,
      name,
      image: finalImage,
      color: color || '#E0F2FE',
      darkColor: darkColor || '#0369A1',
      desc: desc || 'Freeze-dried premium organics.',
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price) * 1.2,
      category,
      gallery: [finalImage],
      details: {
        calories: calories || '80 kcal',
        sugar: sugar || '12g',
        shelfLife: shelfLife || '18 Months',
        ingredients: ingredients || `100% Organic Freeze-Dried ${name}`,
        origin: origin || 'Organic Farm'
      },
      reviews: [],
      stock: stock !== undefined ? Number(stock) : 100,
      reserved: 0,
      createdAt: new Date()
    };

    await db.collection('products').insertOne(newProduct);
    console.log(`[Product Created] Injected new product to MongoDB: ${name} (ID: ${finalSlug})`);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error creating dynamic product:', error);
    return NextResponse.json({ error: 'Internal product creation failure' }, { status: 500 });
  }
}
