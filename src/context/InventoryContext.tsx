"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export type ProductType = 'phone' | 'tablet' | 'accessory';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  brand: string;
  model: string;
  storage?: string;
  color?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  barcode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  purchases: string[]; // Array of sale IDs
}

export interface Sale {
  id: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  discount: number;
  finalTotal: number;
  paymentMethod: string;
  customerId?: string | null;
  createdAt: Date;
}

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  sales: Sale[];
  customers: Customer[];
  addProduct: (product: Omit<Product, 'id' | 'barcode' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'purchases'>) => string;
  updateCustomer: (id: string, customer: Partial<Omit<Customer, 'id' | 'purchases'>>) => void;
  deleteCustomer: (id: string, deleteSales?: boolean) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => string;
  deleteSale: (id: string) => void;
  getTotalSales: (days?: number) => number;
  getProductStock: (productId: string) => number;
}

// Initial mock data for products and suppliers
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 13',
    type: 'phone',
    brand: 'Apple',
    model: 'iPhone 13',
    storage: '128GB',
    color: 'Midnight',
    purchasePrice: 700,
    sellingPrice: 899,
    stock: 15,
    barcode: '123456789012',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Samsung Galaxy S22',
    type: 'phone',
    brand: 'Samsung',
    model: 'Galaxy S22',
    storage: '256GB',
    color: 'Phantom Black',
    purchasePrice: 650,
    sellingPrice: 849,
    stock: 10,
    barcode: '123456789013',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'iPad Air',
    type: 'tablet',
    brand: 'Apple',
    model: 'iPad Air',
    storage: '64GB',
    color: 'Space Gray',
    purchasePrice: 500,
    sellingPrice: 649,
    stock: 8,
    barcode: '123456789014',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'AirPods Pro',
    type: 'accessory',
    brand: 'Apple',
    model: 'AirPods Pro',
    purchasePrice: 180,
    sellingPrice: 249,
    stock: 20,
    barcode: '123456789015',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Samsung Galaxy Watch 5',
    type: 'accessory',
    brand: 'Samsung',
    model: 'Galaxy Watch 5',
    color: 'Silver',
    purchasePrice: 220,
    sellingPrice: 299,
    stock: 12,
    barcode: '123456789016',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const initialSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Tech Distributors Inc.',
    contactName: 'John Smith',
    phone: '555-1234',
    email: 'john@techdist.com',
    address: '123 Tech Ave, Silicon Valley, CA',
  },
  {
    id: '2',
    name: 'Mobile Wholesale Supply',
    contactName: 'Sarah Johnson',
    phone: '555-5678',
    email: 'sarah@mobilewholesale.com',
    address: '456 Mobile Rd, Phonetown, NY',
  },
];

const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Jane Smith',
    phone: '555-1111',
    address: '123 Apple St, Techville, CA',
    purchases: ['1']
  },
  {
    id: '2',
    name: 'Michael Johnson',
    phone: '555-2222',
    address: '456 Orange Ave, Phonetown, NY',
    purchases: ['2']
  }
];

const initialSales: Sale[] = [
  {
    id: '31680654860648656',
    items: [
      { productId: '1', quantity: 1, price: 899 },
      { productId: '4', quantity: 1, price: 249 },
    ],
    total: 1148,
    discount: 50,
    finalTotal: 1098,
    paymentMethod: 'credit_card',
    customerId: '1',
    createdAt: new Date(Date.now() - 86400000), // Yesterday
  },
  {
    id: '06548606840564848',
    items: [
      { productId: '2', quantity: 1, price: 849 },
    ],
    total: 849,
    discount: 0,
    finalTotal: 849,
    paymentMethod: 'cash',
    customerId: '2',
    createdAt: new Date(Date.now() - 43200000), // 12 hours ago
  },
];

// Create the Context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Provider Component
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  // Load data from localStorage if available
  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    const storedSuppliers = localStorage.getItem('suppliers');
    const storedSales = localStorage.getItem('sales');
    const storedCustomers = localStorage.getItem('customers');

    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedSuppliers) setSuppliers(JSON.parse(storedSuppliers));
    if (storedSales) setSales(JSON.parse(storedSales));
    if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [products, suppliers, sales, customers]);

  // Add a new product
  const addProduct = (product: Omit<Product, 'id' | 'barcode' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      barcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      createdAt: now,
      updatedAt: now,
    };
    setProducts([...products, newProduct]);
  };

  // Update a product
  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, ...product, updatedAt: new Date() } : p
    ));
  };

  // Delete a product
  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Get a product by ID
  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  // Add a supplier
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  // Add a customer
  const addCustomer = (customer: Omit<Customer, 'id' | 'purchases'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      purchases: []
    };
    
    setCustomers([...customers, newCustomer]);
    return newCustomer.id;
  };

  // Update a customer
  const updateCustomer = (id: string, customer: Partial<Omit<Customer, 'id' | 'purchases'>>) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, ...customer } : c
    ));
  };

  // Delete a customer
  const deleteCustomer = (id: string, deleteSales: boolean = false) => {
    // Get customer purchases
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    // If deleteSales is true, delete all sales associated with this customer
    if (deleteSales) {
      customer.purchases.forEach(saleId => {
        deleteSale(saleId);
      });
    } else {
      // Otherwise just remove the customer ID from the sales
      setSales(sales.map(sale => 
        sale.customerId === id ? { ...sale, customerId: null } : sale
      ));
    }
    
    // Remove the customer
    setCustomers(customers.filter(c => c.id !== id));
  };

  // Add a sale
  const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    // Update product stock
    sale.items.forEach(item => {
      updateProduct(item.productId, {
        stock: (getProduct(item.productId)?.stock || 0) - item.quantity
      });
    });
    
    // Update customer purchases if a customer is associated with this sale
    if (sale.customerId) {
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === sale.customerId
            ? { ...customer, purchases: [...customer.purchases, newSale.id] }
            : customer
        )
      );
    }
    
    setSales([...sales, newSale]);
    return newSale.id;
  };

  // Delete a sale and restore inventory
  const deleteSale = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;
    
    // Restore product stock
    sale.items.forEach(item => {
      const product = getProduct(item.productId);
      if (product) {
        updateProduct(item.productId, {
          stock: product.stock + item.quantity
        });
      }
    });
    
    // Remove sale from customer purchases if applicable
    if (sale.customerId) {
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === sale.customerId
            ? { 
                ...customer, 
                purchases: customer.purchases.filter(purchaseId => purchaseId !== id) 
              }
            : customer
        )
      );
    }
    
    // Remove the sale
    setSales(sales.filter(s => s.id !== id));
  };

  // Get total sales for the last X days
  const getTotalSales = (days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sales
      .filter(sale => new Date(sale.createdAt) >= cutoffDate)
      .reduce((total, sale) => total + sale.finalTotal, 0);
  };

  // Get product stock
  const getProductStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.stock : 0;
  };

  const value = {
    products,
    suppliers,
    sales,
    customers,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    addSupplier,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addSale,
    deleteSale,
    getTotalSales,
    getProductStock,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

// Custom hook to use the inventory context
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
