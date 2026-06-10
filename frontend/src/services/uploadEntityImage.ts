import { api } from "./api";

export async function uploadEntityImage(file: File) {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post("/uploads/entities", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.imageUrl as string;
}