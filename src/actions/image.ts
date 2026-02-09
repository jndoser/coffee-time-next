"use server";

import { uploadImage, deleteImage } from "@/lib/cloudinary";

export async function uploadImages(formData: FormData) {
  try {
    const formDataEntryValues = Array.from(formData.values());

    const responseData = [];

    for (const formDataEntryValue of formDataEntryValues) {
        if (formDataEntryValue instanceof File) {
             const data = (await uploadImage(
                formDataEntryValue,
                "nextjs-coffee-images"
              )) as any;
              responseData.push({
                display_name: data.display_name,
                public_id: data.public_id,
                url: data.url,
              });
        }
    }

    return { responseData };
  } catch (error: any) {
    throw new Error("Error while uploading images: " + error.message);
  }
}

export async function deleteImageAction(id: string) {
    try {
        const deleteResult = await deleteImage(
            "nextjs-coffee-images/" + id
        );
        return { deleteResult };
    } catch (error: any) {
        throw new Error("Error while deleting image: " + error.message);
    }
}
