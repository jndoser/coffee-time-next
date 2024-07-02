import connect from "@/lib/db";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json({ message: "Invalid clerkId" }, { status: 400 });
    }

    await connect();

    const user = await User.findOne({ clerkId: clerkId });
    if (!user) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while fetching user info " + error },
      { status: 500 }
    );
  }
}
