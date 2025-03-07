
import { Product, Sale } from "@/context/InventoryContext";
import { formatCurrency } from "./inventoryService";

/**
 * Calculate total revenue from sales
 */
export const calculateTotalRevenue = (sales: Sale[]): number => {
  return sales.reduce((total, sale) => total + sale.finalTotal, 0);
};

/**
 * Calculate total profit from sales and products
 */
export const calculateTotalProfit = (sales: Sale[], products: Product[]): number => {
  return sales.reduce((total, sale) => {
    const saleProfit = sale.items.reduce((itemsProfit, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return itemsProfit;
      
      const itemProfit = (item.price - product.purchasePrice) * item.quantity;
      return itemsProfit + itemProfit;
    }, 0);
    
    return total + saleProfit;
  }, 0);
};

/**
 * Format a date for display
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate a simple invoice text
 */
export const generateInvoiceText = (
  sale: Sale, 
  products: Product[], 
  businessInfo: { name: string, address: string, phone: string }
): string => {
  const items = sale.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      name: product ? product.name : 'Unknown Product',
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    };
  });
  
  let invoiceText = `
${businessInfo.name}
${businessInfo.address}
Phone: ${businessInfo.phone}

INVOICE #${sale.id}
Date: ${formatDate(sale.createdAt)}

ITEMS:
${items.map(item => `${item.name} x${item.quantity} @ ${formatCurrency(item.price)} = ${formatCurrency(item.total)}`).join('\n')}

Subtotal: ${formatCurrency(sale.total)}
Discount: ${formatCurrency(sale.discount)}
TOTAL: ${formatCurrency(sale.finalTotal)}

Payment Method: ${sale.paymentMethod.replace('_', ' ').toUpperCase()}

Thank you for your business!
  `.trim();
  
  return invoiceText;
};

/**
 * Print an invoice
 */
export const printInvoice = (
  sale: Sale, 
  products: Product[], 
  businessInfo: { name: string, address: string, phone: string }
): void => {
  const invoiceText = generateInvoiceText(sale, products, businessInfo);
  
  // Create a temporary div for printing
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${sale.id}</title>
          <style>
            body {
              font-family: monospace;
              padding: 20px;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          ${invoiceText.replace(/\n/g, '<br>')}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a small delay to ensure the content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
};

/**
 * Get sales for a specific date range
 */
export const getSalesForDateRange = (
  sales: Sale[], 
  startDate: Date, 
  endDate: Date
): Sale[] => {
  return sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= startDate && saleDate <= endDate;
  });
};

/**
 * Get sales grouped by day
 */
export const getSalesByDay = (sales: Sale[], days = 7): { date: string; total: number }[] => {
  const result: { date: string; total: number }[] = [];
  const endDate = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    
    const daySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= date && saleDate < nextDate;
    });
    
    const dayTotal = daySales.reduce((total, sale) => total + sale.finalTotal, 0);
    
    result.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: dayTotal
    });
  }
  
  return result;
};
