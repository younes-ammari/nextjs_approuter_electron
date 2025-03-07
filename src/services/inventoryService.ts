
import { Product, ProductType } from "@/context/InventoryContext";

/**
 * Format currency based on the locale
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Calculate profit from a product
 */
export const calculateProfit = (product: Product): number => {
  return product.sellingPrice - product.purchasePrice;
};

/**
 * Calculate profit margin as a percentage
 */
export const calculateProfitMargin = (product: Product): number => {
  const profit = calculateProfit(product);
  return (profit / product.sellingPrice) * 100;
};

/**
 * Filter products by type
 */
export const filterProductsByType = (products: Product[], type: ProductType | 'all'): Product[] => {
  if (type === 'all') return products;
  return products.filter(product => product.type === type);
};

/**
 * Filter products by stock status
 */
export const filterProductsByStock = (
  products: Product[], 
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'all'
): Product[] => {
  switch (status) {
    case 'in-stock':
      return products.filter(product => product.stock > 5);
    case 'low-stock':
      return products.filter(product => product.stock > 0 && product.stock <= 5);
    case 'out-of-stock':
      return products.filter(product => product.stock === 0);
    case 'all':
    default:
      return products;
  }
};

/**
 * Search products by name, brand, or model
 */
export const searchProducts = (products: Product[], query: string): Product[] => {
  const lowerCaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerCaseQuery) ||
    product.brand.toLowerCase().includes(lowerCaseQuery) ||
    product.model.toLowerCase().includes(lowerCaseQuery)
  );
};

/**
 * Sort products by various criteria
 */
export const sortProducts = (
  products: Product[], 
  sortBy: 'name' | 'price' | 'stock' | 'profit' | 'updated',
  sortOrder: 'asc' | 'desc' = 'asc'
): Product[] => {
  const sortedProducts = [...products];
  
  sortedProducts.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'price':
        valueA = a.sellingPrice;
        valueB = b.sellingPrice;
        break;
      case 'stock':
        valueA = a.stock;
        valueB = b.stock;
        break;
      case 'profit':
        valueA = calculateProfit(a);
        valueB = calculateProfit(b);
        break;
      case 'updated':
        valueA = new Date(a.updatedAt).getTime();
        valueB = new Date(b.updatedAt).getTime();
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sortedProducts;
};
