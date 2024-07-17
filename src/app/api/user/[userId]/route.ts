import connect from "@/lib/db";
import User from "@/lib/models/user";
import { clerkClient } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, context: { params: any }) {
  try {
    const { userId } = context.params;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    await connect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        {
          status: 404,
        }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (!["SET_ROLE", "REJECT"].includes(action.toUpperCase())) {
      return NextResponse.json(
        { message: "Invalid action value" },
        {
          status: 400,
        }
      );
    }

    if (action === "SET_ROLE") {
      const { role } = body;
      if (!["admin", "owner", "user"].includes(role.toLowerCase())) {
        return NextResponse.json(
          { message: "Invalid role value" },
          {
            status: 400,
          }
        );
      }
      const clerkId = user.clerkId;
      await clerkClient.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          role: "owner",
        },
      });

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: role },
        { new: true }
      );
      return NextResponse.json(
        { message: "Update role successfully", updatedUser },
        { status: 200 }
      );
    }

    if (action === "REJECT") {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isRejected: true },
        { new: true }
      );
      return NextResponse.json(
        { message: "Rejected successfully", updatedUser },
        { status: 200 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while setting role for this user " + error },
      { status: 500 }
    );
  }
}
