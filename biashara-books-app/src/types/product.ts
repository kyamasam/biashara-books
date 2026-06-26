export type ProductCategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductCategoryResponse = {
  success: boolean;
  message: string;
  data: ProductCategory[];
  timestamp: string;
  path: string | null;
};

export type ProductCategoryName = ProductCategory['name'];

export type ProductInventory = {
  id: string;
  productId: string;
  quantity: number;
  inventoryType: string;
  unitMetric: string | null;
  unitPurchasePrice: number;
  unitSalePrice: number;
  priceIncludesTax: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiProduct = {
  id: string;
  name: string;
  photoUrl: string;
  description: string;
  productCategoryId: string;
  businessId: string;
  totalQuantity: number;
  price: number;
  inventory: ProductInventory[];
  createdAt: string;
  updatedAt: string;
};

export type ProductPage = {
  content: ApiProduct[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type ProductsResponse = {
  success: boolean;
  message: string;
  data: ProductPage;
  timestamp: string;
  path: string | null;
};

export type Product = {
  id: string;
  inventoryId: string;
  name: string;
  price: number;
  imageUrl: string;
  productCategoryId: string;
  category: ProductCategoryName;
  stockQuantity: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartMap = Record<string, number>;
