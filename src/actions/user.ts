"use server";

import connect from "@/lib/db";
import User from "@/lib/models/user";
import { clerkClient } from "@clerk/nextjs/server";
import { Types } from "mongoose";

export async function fetchUsers({
  clerkId,
  role,
  isRejected = null,
  page = 1,
  limit = 5,
  searchKeywords = "",
}: {
  clerkId?: string;
  role?: string;
  isRejected?: boolean | string | null;
  page?: number;
  limit?: number;
  searchKeywords?: string;
}) {
  try {
    let filter: any = {};

    if (clerkId) {
      filter.clerkId = clerkId;
    }

    if (role) {
      if (!["admin", "owner", "user"].includes(role)) {
        throw new Error("Invalid action value");
      }
      filter.role = role;
    }

    if (isRejected === "true" || isRejected === true) {
        filter.isRejected = true;
    } else if (isRejected === "false" || isRejected === false) {
        filter.isRejected = false;
    } else {
        // Default behavior (null) - mimic API
        filter.isRejected = null;
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

    return {
        users: JSON.parse(JSON.stringify(users)),
        totalCount
    };
  } catch (error: any) {
    throw new Error("Error while fetching user info: " + error.message);
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid or missing userId");
    }

    await connect();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!["admin", "owner", "user"].includes(role.toLowerCase())) {
        throw new Error("Invalid role value");
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
      return {
        message: "Update role successfully",
        updatedUser: JSON.parse(JSON.stringify(updatedUser)),
      };
  } catch (error: any) {
    throw new Error("Error while setting role for this user: " + error.message);
  }
}

export async function rejectUser(userId: string) {
  try {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid or missing userId");
    }

    await connect();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isRejected: true },
        { new: true }
      );
      return {
        message: "Rejected successfully",
        updatedUser: JSON.parse(JSON.stringify(updatedUser)),
      };
  } catch (error: any) {
    throw new Error("Error while setting role for this user: " + error.message);
  }
}
