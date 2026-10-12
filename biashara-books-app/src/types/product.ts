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

export type InventoryCategory = 'physical' | 'service';
export type InventoryType = 'unit' | 'count';
export type UnitMetric =
  | 'kg' | 'g' | 'mg' | 'lb' | 'oz'
  | 'l' | 'ml'
  | 'm' | 'cm' | 'mm' | 'ft'
  | 'dozen' | 'box' | 'bag' | 'bundle' | 'pack' | 'crate' | 'carton' | 'roll' | 'pair' | 'set';

export type InventoryProduct = {
  id: string;
  name: string;
  photoUrl: string | null;
  description: string | null;
  productCategoryId: string;
  businessId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryListItem = {
  id: string;
  productId: string;
  product: InventoryProduct | null;
  inventoryCategory: InventoryCategory;
  inventoryType: InventoryType;
  quantity: number | null;
  unitMetric: UnitMetric | null;
  unitPurchasePrice: number;
  unitSalePrice: number;
  priceIncludesTax: boolean;
  locationId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiInventoryWithProduct = {
  inventory: Omit<InventoryListItem, 'product'>;
  product: InventoryProduct | null;
};

export type ProductInventoryResponse = {
  id: string;
  name: string;
  photoUrl: string | null;
  description: string | null;
  productCategoryId: string;
  businessId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  inventories: Omit<InventoryListItem, 'product'>[];
  totalQuantity: number;
  inStock: boolean;
};

export type InventoryDetails = {
  quantity?: number;
  unitPurchasePrice: number;
  unitSalePrice: number;
  priceIncludesTax: boolean;
  locationId?: string;
};

export type CreateProductRequest = {
  name: string;
  description?: string;
  photoUrl?: string;
  productCategoryId?: string;
  inventoryCategory: InventoryCategory;
  inventoryType: InventoryType;
  unitMetric?: UnitMetric;
  inventoryDetails?: InventoryDetails;
};

export type UploadPhotoResponse = {
  success: boolean;
  message: string;
  data: { url: string };
  timestamp: string;
  path: null;
};

export type ProductEntity = {
  id: string;
  name: string;
  photoUrl: string | null;
  description: string | null;
  productCategoryId: string | null;
  inventoryType: InventoryType;
  inventoryCategory: InventoryCategory;
  unitMetric: UnitMetric | null;
  userId: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductEntityResponse = {
  success: boolean;
  message: string;
  data: ProductEntity;
  timestamp: string;
  path: string | null;
};

export type CreateInventoryRequest = {
  productId: string;
  inventoryCategory: InventoryCategory;
  inventoryType: InventoryType;
  quantity?: number;
  unitMetric?: UnitMetric;
  unitPurchasePrice: number;
  unitSalePrice: number;
  priceIncludesTax: boolean;
  locationId?: string;
};
