import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  // Get the user's session (includes accessToken if configured in NextAuth)
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

 
  if (!session || typeof session !== "object" || !("accessToken" in session)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const accessToken = (session as { accessToken?: string }).accessToken;


  if (!accessToken) {
    return NextResponse.json({ error: "No access token found" }, { status: 401 });
  }

  // Fetch the user's repos from GitHub
  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: response.status });
  }

  const repos = await response.json();
  return NextResponse.json(repos);
}
