import connect from "@/lib/db";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const searchKeywords = searchParams.get("searchKeywords") as string;

    let filter: any = {};

    if (clerkId) {
      filter.clerkId = clerkId;
    }

    if (role) {
      if (!["admin", "owner", "user"].includes(role)) {
        return NextResponse.json(
          { message: "Invalid action value" },
          { status: 400 }
        );
      }
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    if (searchKeywords) {
      filter.$or = [
        {
          email: { $regex: searchKeywords, $options: "i" },
        },
        { lastName: { $regex: searchKeywords, $options: "i" } },
        { firstName: { $regex: searchKeywords, $options: "i" } },
      ];
    }

    await connect();

    const users = await User.find(filter).skip(skip).limit(limit);
    const totalCount = await User.countDocuments(filter);

    return NextResponse.json({ users, totalCount }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while fetching user info " + error },
      { status: 500 }
    );
  }
}
