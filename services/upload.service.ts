import { api } from "@/lib/api";
import type { Document } from "@/types/document";

export const uploadService = {
  uploadFile: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Upload failed");
    return response.json();
  },

  getDocuments: () => api.get<Document[]>("/documents"),

  getDocument: (id: string) => api.get<Document>(`/documents/${id}`),

  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
};
