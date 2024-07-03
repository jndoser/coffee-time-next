import { uploadImage } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const formDataEntryValues = Array.from(formData.values());

  const imageURLs = [];

  for (const formDataEntryValue of formDataEntryValues) {
    console.log("formDataEntryValue: ", formDataEntryValue as File);
    const data = (await uploadImage(
      formDataEntryValue as File,
      "nextjs-coffee-images"
    )) as any;
    imageURLs.push(data.url);
  }

  console.log("imageURLs: ", imageURLs);

  return NextResponse.json({ imageURLs }, { status: 201 });
}
