import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useInventory, Product } from "@/context/InventoryContext";
import { formatCurrency } from "@/services/inventoryService";
import { printInvoice, formatDate } from "@/services/salesService";
import { Minus, Plus, Search, ShoppingCart, Trash2, Receipt, Package, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Barcode from "@/components/Barcode";

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

const SalesForm = () => {
  const { products, addSale, customers } = useInventory();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Auto-focus on barcode input
  useEffect(() => {
    const barcodeInput = document.getElementById('barcode-input');
    if (barcodeInput) barcodeInput.focus();
  }, [items]);
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);
  
  // Handle scanning/adding product by barcode
  const handleAddByBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode.trim()) return;
    
    const product = products.find(p => p.barcode === barcode);
    
    if (!product) {
      toast.error("المنتج غير موجود");
      return;
    }
    
    if (product.stock <= 0) {
      toast.error("المنتج غير متوفر في المخزون");
      return;
    }
    
    addItemToSale(product);
    setBarcode('');
  };
  
  // Handle adding product from dropdown
  const handleAddFromDropdown = (productId: string) => {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      toast.error("المنتج غير موجود");
      return;
    }
    
    if (product.stock <= 0) {
      toast.error("المنتج غير متوفر في المخزون");
      return;
    }
    
    addItemToSale(product);
  };
  
  // Add product to sale
  const addItemToSale = (product: Product) => {
    const existingItemIndex = items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if already in cart
      const newItems = [...items];
      
      // Check if we have enough stock
      const currentQty = newItems[existingItemIndex].quantity;
      if (currentQty >= product.stock) {
        toast.error("لا يوجد مخزون كافٍ متاح");
        return;
      }
      
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: currentQty + 1
      };
      
      setItems(newItems);
    } else {
      // Add new item
      setItems([
        ...items,
        {
          productId: product.id,
          quantity: 1,
          price: product.sellingPrice
        }
      ]);
    }
    
    toast.success(`تمت إضافة: ${product.name}`);
  };
  
  // Handle quantity change
  const handleQuantityChange = (index: number, change: number) => {
    const newItems = [...items];
    const item = newItems[index];
    const product = products.find(p => p.id === item.productId);
    
    if (!product) return;
    
    const newQuantity = item.quantity + change;
    
    // Don't allow negative or zero quantity
    if (newQuantity <= 0) {
      newItems.splice(index, 1);
    } else {
      // Check stock limits
      if (change > 0 && newQuantity > product.stock) {
        toast.error("لا يوجد مخزون كافٍ متاح");
        return;
      }
      
      newItems[index] = {
        ...item,
        quantity: newQuantity
      };
    }
    
    setItems(newItems);
  };
  
  // Remove item from sale
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  // Show sale preview
  const handlePreviewSale = () => {
    if (items.length === 0) {
      toast.error("لا توجد عناصر في السلة");
      return;
    }
    
    setShowPreview(true);
  };
  
  // Process the sale
  const handleProcessSale = () => {
    if (items.length === 0) {
      toast.error("لا توجد عناصر في السلة");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const saleId = addSale({
        items,
        total: subtotal,
        discount,
        finalTotal: total,
        paymentMethod,
        customerId: selectedCustomerId
      });
      
      const sale = {
        id: saleId,
        items,
        total: subtotal,
        discount,
        finalTotal: total,
        paymentMethod,
        customerId: selectedCustomerId,
        createdAt: new Date()
      };
      
      // Print invoice
      printInvoice(sale, products, {
        name: "MobileStock Store",
        address: "123 Mobile Avenue, Techville",
        phone: "(555) 123-4567"
      });
      
      toast.success("اكتمل البيع بنجاح");
      
      // Reset form
      setItems([]);
      setDiscount(0);
      setPaymentMethod('cash');
      setSelectedCustomerId(null);
      setShowPreview(false);
    } catch (error) {
      console.error("Error processing sale:", error);
      toast.error("خطأ في معالجة عملية البيع");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Find the selected customer
  const selectedCustomer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId) 
    : null;
  
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="col-span-2 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">عملية بيع جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            {/* Barcode Scanner and Product Selection Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Barcode Scanner */}
              <div className="space-y-2">
                <Label>إضافة بواسطة الباركود</Label>
                <form onSubmit={handleAddByBarcode} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="barcode-input"
                      placeholder="امسح أو أدخل الباركود..."
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="default">
                    <Search className="h-4 w-4 mr-2" />
                    إضافة
                  </Button>
                </form>
              </div>
              
              {/* Product Selection Dropdown */}
              <div className="space-y-2">
                <Label>اختر من المنتجات</Label>
                <Select onValueChange={handleAddFromDropdown}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر منتجًا" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter(p => p.stock > 0)
                      .map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.sellingPrice)} (متوفر {product.stock})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Customer Selection */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Select 
                  value={selectedCustomerId || ""} 
                  onValueChange={(value) => setSelectedCustomerId(value !== "no-customer" ? value : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عميلاً (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-customer">لا يوجد عميل</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2 items-center">
                    <User className="h-4 w-4" />
                    <span>معلومات العميل</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  {selectedCustomer ? (
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">{selectedCustomer.name}</h3>
                      <div className="grid grid-cols-[1fr_2fr] gap-1 text-sm">
                        <span className="text-muted-foreground">الهاتف:</span>
                        <span>{selectedCustomer.phone}</span>
                        <span className="text-muted-foreground">العنوان:</span>
                        <span>{selectedCustomer.address}</span>
                        <span className="text-muted-foreground">المشتريات:</span>
                        <span>{selectedCustomer.purchases.length}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-2">
                      لم يتم اختيار عميل
                    </p>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="border rounded-md">
            {items.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>لم تتم إضافة أي عناصر حتى الآن</p>
                <p className="text-sm">امسح الباركود أو حدد منتجًا للإضافة</p>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={item.productId} className="py-3 px-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} لكل
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-md">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => handleQuantityChange(index, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => handleQuantityChange(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="w-24 text-right font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">ملخص الطلب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="discount">الخصم</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="payment-method">طريقة الدفع</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger id="payment-method" className="w-full">
                <SelectValue placeholder="حدد طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">نقدي</SelectItem>
                <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                <SelectItem value="debit_card">بطاقة خصم</SelectItem>
                <SelectItem value="mobile_payment">الدفع عبر الهاتف المحمول</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedCustomer && (
            <div className="border-t pt-2">
              <p className="text-sm font-medium">العميل: {selectedCustomer.name}</p>
              <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
            </div>
          )}
          
          <div className="border-t pt-4 flex justify-between items-center font-semibold text-lg">
            <span>الإجمالي</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            size="lg"
            disabled={items.length === 0 || isProcessing}
            onClick={handlePreviewSale}
          >
            <Receipt className="h-4 w-4 mr-2" />
            معاينة البيع
          </Button>
        </CardFooter>
      </Card>
      
      {/* Sale Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>معاينة البيع</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">التاريخ:</p>
                <p>{formatDate(new Date())}</p>
              </div>
              {/* Temporary barcode for preview */}
              <div className="flex-shrink-0">
                <Barcode value={Date.now().toString()} size="md" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-1">تفاصيل العميل</h3>
                {selectedCustomerId ? (
                  (() => {
                    const customer = customers.find(c => c.id === selectedCustomerId);
                    return customer ? (
                      <div className="space-y-1">
                        <p>{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        <p className="text-sm text-muted-foreground">{customer.address}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">بيانات العميل غير موجودة</p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">عميل عادي</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-1">معلومات الدفع</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">طريقة الدفع:</span>
                    <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">المجموع الفرعي:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">الخصم:</span>
                    <span>{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>الإجمالي:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">العناصر</h3>
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-12 bg-muted/30 text-sm font-medium py-2 px-4">
                  <div className="col-span-6">المنتج</div>
                  <div className="col-span-2 text-right">السعر</div>
                  <div className="col-span-2 text-right">الكمية</div>
                  <div className="col-span-2 text-right">المجموع الفرعي</div>
                </div>
                
                <div className="divide-y">
                  {items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={index} className="grid grid-cols-12 py-2 px-4 text-sm">
                        <div className="col-span-6">
                          {product ? (
                            <>
                              <div>{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.brand} {product.model}</div>
                            </>
                          ) : (
                            'منتج غير معروف'
                          )}
                        </div>
                        <div className="col-span-2 text-right">{formatCurrency(item.price)}</div>
                        <div className="col-span-2 text-right">{item.quantity}</div>
                        <div className="col-span-2 text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="bg-muted/10 px-4 py-2 text-right">
                  <div className="space-y-1">
                    <div className="flex justify-end">
                      <span className="w-24 text-sm text-muted-foreground">المجموع الفرعي:</span>
                      <span className="w-24">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-end">
                      <span className="w-24 text-sm text-muted-foreground">الخصم:</span>
                      <span className="w-24">{formatCurrency(discount)}</span>
                    </div>
                    <div className="flex justify-end font-medium">
                      <span className="w-24">الإجمالي:</span>
                      <span className="w-24">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                الرجوع إلى البيع
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    handleProcessSale();
                  }}
                  disabled={isProcessing}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  إتمام عملية البيع
                </Button>
                <Button
                  onClick={() => {
                    setShowPreview(false);
                    handleProcessSale();
                    
                    // We'll print automatically when processing
                  }}
                  disabled={isProcessing}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  إتمام عملية البيع والطباعة
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesForm;