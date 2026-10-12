import { File, UploadType } from 'expo-file-system';
import { create } from 'zustand';

import { API_BASE_URL, authDelete, authGet, authPost, authPut, resolveMediaUrl } from '@/lib/api';
import { getStoredToken } from '@/lib/token-storage';
import type {
  ApiProduct,
  CreateProductRequest,
  ProductCategory,
  ProductCategoryResponse,
  ProductsResponse,
  UploadPhotoResponse,
} from '@/types/product';

type ProductStoreState = {
  products: ApiProduct[];
  currentPage: number;
  totalPages: number;
  categories: ProductCategory[];
  isLoading: boolean;
  isFetchingMore: boolean;
  isFetchingCategories: boolean;
  isManagingCategory: boolean;
  isUploading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;
  lastUploadedUrl: string | null;
  fetchProducts: (page?: number, size?: number, name?: string, categoryId?: string, append?: boolean) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<ProductCategory>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  uploadPhoto: (imageUri: string) => Promise<string>;
  createProduct: (
    payload: CreateProductRequest,
    imageUri?: string,
  ) => Promise<{ id: string }>;
  updateProduct: (id: string, payload: CreateProductRequest) => Promise<void>;
  clearError: () => void;
};

export const useProductStore = create<ProductStoreState>((set, get) => ({
  products: [],
  currentPage: 1,
  totalPages: 1,
  categories: [],
  isLoading: false,
  isFetchingMore: false,
  isFetchingCategories: false,
  isManagingCategory: false,
  isUploading: false,
  isCreating: false,
  isDeleting: false,
  error: null,
  lastUploadedUrl: null,

  fetchProducts: async (page = 1, size = 20, name, categoryId, append = false) => {
    set(append ? { isFetchingMore: true, error: null } : { isLoading: true, error: null });
    try {
      const query = new URLSearchParams({ page: String(page), size: String(size) });
      if (name) query.set('name', name);
      if (categoryId) query.set('categoryId', categoryId);
      const response = await authGet<ProductsResponse>(`/api/products?${query.toString()}`);
      const { content, totalPages } = response.data;
      set((state) => ({
        isLoading: false,
        isFetchingMore: false,
        products: append ? [...state.products, ...content] : content,
        currentPage: page,
        totalPages,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not load products.';
      set({ isLoading: false, isFetchingMore: false, error: message });
      throw error;
    }
  },

  fetchCategories: async () => {
    set({ isFetchingCategories: true });
    try {
      const response = await authGet<ProductCategoryResponse>('/api/categories');
      set({ isFetchingCategories: false, categories: response.data });
    } catch {
      set({ isFetchingCategories: false });
    }
  },

  createCategory: async (name) => {
    set({ isManagingCategory: true, error: null });
    try {
      const response = await authPost<{ data: ProductCategory }>('/api/categories', { name });
      await get().fetchCategories();
      set({ isManagingCategory: false });
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not create category.';
      set({ isManagingCategory: false, error: message });
      throw error;
    }
  },

  updateCategory: async (id, name) => {
    set({ isManagingCategory: true, error: null });
    try {
      await authPut(`/api/categories/${id}`, { name });
      await get().fetchCategories();
      set({ isManagingCategory: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not update category.';
      set({ isManagingCategory: false, error: message });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ isManagingCategory: true, error: null });
    try {
      await authDelete(`/api/categories/${id}`);
      await get().fetchCategories();
      set({ isManagingCategory: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not delete category.';
      set({ isManagingCategory: false, error: message });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await authDelete(`/api/products/${id}`);
      set((state) => ({
        isDeleting: false,
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not delete product.';
      set({ isDeleting: false, error: message });
      throw error;
    }
  },

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
      const resolvedUrl = resolveMediaUrl(response.data.url) ?? response.data.url;
      set({ isUploading: false, lastUploadedUrl: resolvedUrl });
      return resolvedUrl;
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

  updateProduct: async (id, payload) => {
    set({ isCreating: true, error: null });
    try {
      await authPut(`/api/products/${id}`, payload as Record<string, unknown>);
      set({ isCreating: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not update product.';
      set({ isCreating: false, error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
