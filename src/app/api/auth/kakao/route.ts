import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { code, redirectUri } = await request.json();

  // Exchange authorization code for access token
  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!,
      client_secret: process.env.KAKAO_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const error = await tokenRes.text();
    return NextResponse.json(
      { error: "Kakao token exchange failed", detail: error },
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
      type: "KAKAO",
    }),
  });

  if (!snsRes.ok) {
    const errorBody = await snsRes.json().catch(() => null);
    const errorCode = errorBody?.code;

    if (errorCode === "AZEYO-AUTH-005") {
      return NextResponse.json(
        { notRegistered: true, snsToken: snsAccessToken, snsType: "KAKAO" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Backend login failed", detail: errorBody?.message || "로그인에 실패했습니다." },
      { status: snsRes.status }
    );
  }

  const authData = await snsRes.json();
  const authTokens = authData.item ?? authData;
  return NextResponse.json(authTokens);
}
