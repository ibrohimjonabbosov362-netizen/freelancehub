import { NextResponse } from "next/server";
import { isGoogleConfigured } from "@/lib/auth";
import { isMailConfigured } from "@/lib/mail";

export async function GET() {
  return NextResponse.json({
    google: isGoogleConfigured(),
    passwordReset: isMailConfigured(),
  });
}
