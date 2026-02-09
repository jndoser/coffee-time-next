"use server";

import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import Feedback from "@/lib/models/feedback";
import User from "@/lib/models/user";
import { Types } from "mongoose";

export interface FeedbacksPage {
  feedbacks: any[];
  nextCursor: string | null;
}

export async function fetchFeedbacks({
  coffeeShopId,
  limit = 5,
  searchKeywords = "",
  isHide,
  cursor,
}: {
  coffeeShopId: string;
  limit?: number;
  searchKeywords?: string;
  isHide?: boolean | string;
  cursor?: string;
}) {
  try {
    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      throw new Error("coffeeShopId is empty or invalid");
    }

    await connect();
    const coffeeShop = await CoffeeShop.findById(coffeeShopId);

    if (!coffeeShop) {
      throw new Error("Coffee Shop does exist");
    }

    let filter: any = {};
    filter.coffeeShop = coffeeShopId;

    if (isHide !== undefined && isHide !== null) {
        filter.isHide = String(isHide) === "true";
    }

    if (searchKeywords) {
      filter.$or = [
        {
          description: { $regex: searchKeywords, $options: "i" },
        },
      ];
    }

    const queryOptions = cursor
      ? { ...filter, _id: { $lt: new Types.ObjectId(cursor) } }
      : filter;

    const feedbacks = await Feedback.find(queryOptions)
      .sort({
        createdAt: "desc",
      })
      .limit(limit + 1)
      .populate("owner");

    const hasNextPage = feedbacks.length > limit;
    const nextCursor = hasNextPage ? feedbacks[limit - 1]._id.toString() : null;

    const feedbackData = feedbacks.slice(0, limit);

    return {
      feedbacks: JSON.parse(JSON.stringify(feedbackData)),
      nextCursor,
    } as FeedbacksPage;
  } catch (error: any) {
    throw new Error("Error while fetching feedback: " + error.message);
  }
}

export async function createFeedback({
  coffeeShopId,
  description,
  numberOfUpvote,
  numberOfDownvote,
}: {
  coffeeShopId: string;
  description: string;
  numberOfUpvote: number;
  numberOfDownvote: number;
}) {
  try {
    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      throw new Error("coffeeShopId is empty or invalid");
    }

    const userId = getUserId();

    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new Error("userId is empty or invalid");
    }

    await connect();
    const coffeeShop = await CoffeeShop.findById(coffeeShopId);

    if (!coffeeShop) {
      throw new Error("Coffee Shop does not exist");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User does not exist");
    }

    const newFeedback = new Feedback({
      description,
      numberOfUpvote,
      numberOfDownvote,
      owner: userId,
      coffeeShop: coffeeShopId,
      isHide: false,
    });

    await newFeedback.save();

    // Populate the owner field
    const populatedFeedback = await Feedback.findById(newFeedback._id).populate(
      "owner"
    );

    return JSON.parse(JSON.stringify(populatedFeedback));
  } catch (error: any) {
    throw new Error("Error while creating feedback: " + error.message);
  }
}

export async function updateFeedbackVisibility(
  feedbackId: string,
  action: "HIDE" | "SHOW"
) {
  try {
    if (!feedbackId || !Types.ObjectId.isValid(feedbackId)) {
      throw new Error("Must have feedbackId and it is invalid");
    }

    await connect();

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      throw new Error("Not found feedback");
    }

    if (action === "HIDE") {
      const updatedFeedback = await Feedback.findByIdAndUpdate(
        feedbackId,
        { isHide: true },
        { new: true }
      );

      return {
        message: "Feedback is hided successfully",
        category: JSON.parse(JSON.stringify(updatedFeedback)),
      };
    } else if (action === "SHOW") {
      const updatedFeedback = await Feedback.findByIdAndUpdate(
        feedbackId,
        { isHide: false },
        { new: true }
      );

      return {
        message: "Feedback is shown successfully",
        category: JSON.parse(JSON.stringify(updatedFeedback)),
      };
    } else {
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    throw new Error("Error while updating feeback: " + error.message);
  }
}
