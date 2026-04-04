import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { code, state } = await request.json();

  // Exchange authorization code for access token
  const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!,
      client_secret: process.env.NAVER_CLIENT_SECRET!,
      code,
      state,
    }),
  });

  if (!tokenRes.ok) {
    const error = await tokenRes.text();
    return NextResponse.json(
      { error: "Naver token exchange failed", detail: error },
      { status: 400 }
    );
  }

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    return NextResponse.json(
      { error: "Naver token exchange failed", detail: tokenData.error_description },
      { status: 400 }
    );
  }

  const snsAccessToken = tokenData.access_token;

  // Call backend SNS login
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const snsRes = await fetch(`${apiBaseUrl}/azeyo/auths/login/sns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: snsAccessToken,
      type: "NAVER",
    }),
  });

  if (!snsRes.ok) {
    const errorBody = await snsRes.json().catch(() => null);
    const errorCode = errorBody?.code;

    if (errorCode === "AZEYO-AUTH-005") {
      return NextResponse.json(
        { notRegistered: true, snsToken: snsAccessToken, snsType: "NAVER" },
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
