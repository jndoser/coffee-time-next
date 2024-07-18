import connect from "@/lib/db";
import Feedback from "@/lib/models/feedback";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, context: { params: any }) {
  try {
    const { feedbackId } = context.params;

    if (!feedbackId || !Types.ObjectId.isValid(feedbackId)) {
      return NextResponse.json(
        { message: "Must have feedbackId and it is invalid" },
        { status: 400 }
      );
    }

    await connect();

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return NextResponse.json(
        { message: "Not found feedback" },
        { status: 404 }
      );
    }

    const { action } = await req.json();

    if (!action) {
      return NextResponse.json(
        { message: "Not found action in request" },
        { status: 400 }
      );
    } else {
      if (!["HIDE", "SHOW"].includes(action.toUpperCase())) {
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
      }

      if (action.toUpperCase() === "HIDE") {
        const updatedFeedback = await Feedback.findByIdAndUpdate(
          feedbackId,
          { isHide: true },
          { new: true }
        );

        return NextResponse.json(
          {
            message: "Feedback is hided successfully",
            category: updatedFeedback,
          },
          {
            status: 200,
          }
        );
      }

      if (action.toUpperCase() === "SHOW") {
        const updatedFeedback = await Feedback.findByIdAndUpdate(
          feedbackId,
          { isHide: false },
          { new: true }
        );

        return NextResponse.json(
          {
            message: "Feedback is shown successfully",
            category: updatedFeedback,
          },
          {
            status: 200,
          }
        );
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while updating feeback " + error },
      { status: 500 }
    );
  }
}
