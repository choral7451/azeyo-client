import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { code, redirectUri } = await request.json();

  // Exchange authorization code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const error = await tokenRes.text();
    return NextResponse.json(
      { error: "Google token exchange failed", detail: error },
      { status: 400 }
    );
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Call backend SNS login
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const snsRes = await fetch(`${apiBaseUrl}/auths/login/sns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: accessToken,
      type: "GOOGLE",
    }),
  });

  if (!snsRes.ok) {
    const error = await snsRes.text();
    return NextResponse.json(
      { error: "Backend login failed", detail: error },
      { status: snsRes.status }
    );
  }

  const authTokens = await snsRes.json();
  return NextResponse.json(authTokens);
}
