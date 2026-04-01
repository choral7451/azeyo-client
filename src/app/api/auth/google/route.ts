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
  const snsAccessToken = tokenData.access_token;

  // Call backend SNS login
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const snsRes = await fetch(`${apiBaseUrl}/azeyo/auths/login/sns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: snsAccessToken,
      type: "GOOGLE",
    }),
  });

  if (!snsRes.ok) {
    const errorBody = await snsRes.json().catch(() => null);
    const errorCode = errorBody?.code;

    // AZEYO-AUTH-005: User not registered → return SNS token for signup
    if (errorCode === "AZEYO-AUTH-005") {
      return NextResponse.json(
        { notRegistered: true, snsToken: snsAccessToken, snsType: "GOOGLE" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Backend login failed", detail: errorBody?.message || "로그인에 실패했습니다." },
      { status: snsRes.status }
    );
  }

  const authTokens = await snsRes.json();
  return NextResponse.json(authTokens);
}
