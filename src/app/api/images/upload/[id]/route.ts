import { deleteImage } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const deleteResult = await deleteImage(
    "nextjs-coffee-images/" + context.params.id
  );
  return NextResponse.json({ deleteResult }, { status: 200 });
}
