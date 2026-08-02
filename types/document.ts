export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
  pageCount?: number;
  summary?: string;
}

export interface UploadResponse {
  document: Document;
  message: string;
}
