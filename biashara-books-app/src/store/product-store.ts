import { File, UploadType } from 'expo-file-system';
import { create } from 'zustand';

import { API_BASE_URL, authPost } from '@/lib/api';
import { getStoredToken } from '@/lib/token-storage';
import type { CreateProductRequest, UploadPhotoResponse } from '@/types/product';

type ProductStoreState = {
  isUploading: boolean;
  isCreating: boolean;
  error: string | null;
  lastUploadedUrl: string | null;
  uploadPhoto: (imageUri: string) => Promise<string>;
  createProduct: (
    payload: CreateProductRequest,
    imageUri?: string,
  ) => Promise<{ id: string }>;
  clearError: () => void;
};

export const useProductStore = create<ProductStoreState>((set, get) => ({
  isUploading: false,
  isCreating: false,
  error: null,
  lastUploadedUrl: null,

  uploadPhoto: async (imageUri) => {
    set({ isUploading: true, error: null, lastUploadedUrl: null });
    try {
      const filename = imageUri.split('/').pop() ?? 'photo.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      const token = await getStoredToken('access_token');
      const url = `${API_BASE_URL.replace(/\/+$/, '')}/api/uploads/photo`;

      const file = new File(imageUri);
      const result = await file.upload(url, {
        uploadType: UploadType.MULTIPART,
        fieldName: 'file',
        mimeType,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (result.status < 200 || result.status >= 300) {
        throw new Error(`Upload failed with status ${result.status}`);
      }

      const response = JSON.parse(result.body) as UploadPhotoResponse;
      set({ isUploading: false, lastUploadedUrl: response.data.url });
      return response.data.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Photo upload failed.';
      set({ isUploading: false, error: message });
      throw error;
    }
  },

  createProduct: async (payload, imageUri) => {
    set({ isCreating: true, error: null });
    try {
      let photoUrl = payload.photoUrl;

      if (imageUri) {
        photoUrl = await get().uploadPhoto(imageUri);
      }

      const response = await authPost<{ data: { id: string } }>(
        '/api/products',
        { ...payload, ...(photoUrl ? { photoUrl } : {}) } as Record<string, unknown>,
      );

      set({ isCreating: false });
      return { id: response.data.id };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not create product.';
      set({ isCreating: false, error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
