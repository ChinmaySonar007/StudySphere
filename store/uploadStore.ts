// Upload store - placeholder for state management
// TODO: Implement with zustand or similar

import type { Document } from "@/types/document";

export interface UploadState {
  documents: Document[];
  isUploading: boolean;
  uploadProgress: number;
  currentUpload: File | null;
}

export const initialUploadState: UploadState = {
  documents: [],
  isUploading: false,
  uploadProgress: 0,
  currentUpload: null,
};
