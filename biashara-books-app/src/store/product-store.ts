import { create } from 'zustand';

import { authPost, authUpload } from '@/lib/api';
import type { CreateProductRequest, UploadPhotoResponse } from '@/types/product';

type ProductStoreState = {
  isUploading: boolean;
  isCreating: boolean;
  error: string | null;
  uploadPhoto: (imageUri: string, token: string) => Promise<string>;
  createProduct: (
    payload: CreateProductRequest,
    token: string,
    imageUri?: string,
  ) => Promise<{ id: string }>;
  clearError: () => void;
};

export const useProductStore = create<ProductStoreState>((set, get) => ({
  isUploading: false,
  isCreating: false,
  error: null,

  uploadPhoto: async (imageUri, token) => {
    set({ isUploading: true, error: null });
    try {
      const filename = imageUri.split('/').pop() ?? 'photo.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      const formData = new FormData();
      formData.append('file', { uri: imageUri, name: filename, type: mimeType } as unknown as Blob);

      const response = await authUpload<UploadPhotoResponse>('/api/uploads/photo', formData, token);
      set({ isUploading: false });
      return response.data.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Photo upload failed.';
      set({ isUploading: false, error: message });
      throw error;
    }
  },

  createProduct: async (payload, token, imageUri) => {
    set({ isCreating: true, error: null });
    try {
      let photoUrl = payload.photoUrl;

      if (imageUri) {
        photoUrl = await get().uploadPhoto(imageUri, token);
      }

      const response = await authPost<{ data: { id: string } }>(
        '/api/products',
        { ...payload, ...(photoUrl ? { photoUrl } : {}) } as Record<string, unknown>,
        token,
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
