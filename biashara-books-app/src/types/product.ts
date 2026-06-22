export type ProductCategory = 'Groceries' | 'Drinks' | 'Animal Products';

export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartMap = Record<string, number>;
