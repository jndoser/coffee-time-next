import { uploadImage } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const formDataEntryValues = Array.from(formData.values());

  const responseData = [];

  for (const formDataEntryValue of formDataEntryValues) {
    const data = (await uploadImage(
      formDataEntryValue as File,
      "nextjs-coffee-images"
    )) as any;
    console.log("response upload image: ", data);
    responseData.push({ public_id: data.public_id, url: data.url });
  }

  return NextResponse.json({ responseData }, { status: 201 });
}
