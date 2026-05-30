import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${new URL(request.url).origin}/api/auth/callback/google`;
  
  // Elegant Auto-Detection Sandbox Bypass
  // A valid Google Client ID must end with ".apps.googleusercontent.com"
  if (!clientId || !clientId.endsWith('.apps.googleusercontent.com')) {
    console.warn(
      `[OAuth Bypass] Google Client ID "${clientId}" is not a valid Google Client ID. ` +
      `Redirecting directly to callback with sandbox authorization bypass.`
    );
    const bypassUrl = `${new URL(request.url).origin}/api/auth/callback/google?code=sandbox_bypass`;
    return NextResponse.redirect(bypassUrl);
  }

  // Official Google OAuth Authorization Flow
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20profile%20email&prompt=consent`;

  return NextResponse.redirect(googleAuthUrl);
}
