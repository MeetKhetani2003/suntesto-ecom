import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Delete the session cookie by setting its maxAge to 0
  response.cookies.set('sustento-session', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
