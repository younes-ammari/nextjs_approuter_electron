import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useInventory, Sale, Product } from "@/context/InventoryContext";
import { formatCurrency } from "@/services/inventoryService";
import { formatDate, printInvoice } from "@/services/salesService";
import { Receipt, Printer, Barcode } from "lucide-react";

interface InvoicePreviewDialogProps {
  saleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoicePreviewDialog = ({ saleId, open, onOpenChange }: InvoicePreviewDialogProps) => {
  const { sales, products, customers } = useInventory();
  
  const sale = sales.find(s => s.id === saleId);
  const customer = sale?.customerId ? customers.find(c => c.id === sale.customerId) : null;
  
  if (!sale) {
    return null;
  }
  
  const handlePrint = () => {
    printInvoice(sale, products, {
      name: "Mobile Store",
      address: "123 Main Street, Anytown",
      phone: "555-123-4567"
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            فاتورة رقم {sale.id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">التاريخ:</p>
              <p className="font-medium">{formatDate(sale.createdAt)}</p>
            </div>
            
            <div className="text-right">
              <p className="text-muted-foreground">طريقة الدفع:</p>
              <p className="font-medium">{sale.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          
          {customer && (
            <div className="rounded-md border p-3 bg-muted/30">
              <p className="text-sm font-medium mb-1">العميل</p>
              <p className="text-sm">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium mb-2">العناصر</h3>
            <div className="space-y-2">
              {sale.items.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={index} className="flex justify-between text-sm border-b pb-2">
                    <div>
                      {product ? product.name : 'منتج غير معروف'} x{item.quantity}
                    </div>
                    <div className="text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-between pt-2 border-t">
            <div className="text-sm">المجموع الفرعي</div>
            <div>{formatCurrency(sale.total)}</div>
          </div>
          
          {sale.discount > 0 && (
            <div className="flex justify-between text-sm">
              <div>الخصم</div>
              <div>-{formatCurrency(sale.discount)}</div>
            </div>
          )}
          
          <div className="flex justify-between font-medium text-lg">
            <div>الإجمالي</div>
            <div>{formatCurrency(sale.finalTotal)}</div>
          </div>
          
          <div className="flex justify-center">
            <Barcode className="h-12 w-12 text-muted-foreground opacity-70" />
            <div className="text-sm text-muted-foreground">
              {sale.id}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handlePrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            طباعة الفاتورة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;