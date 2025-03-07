import { useState } from "react";
import { useInventory, Product, ProductType } from "@/context/InventoryContext";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    filterProductsByType,
    filterProductsByStock,
    searchProducts,
    sortProducts
} from "@/services/inventoryService";
import {
    Filter,
    Package,
    Plus,
    Search,
    SortAsc,
    Smartphone,
    Tablet,
    Headphones
} from "lucide-react";
import { toast } from "sonner";
import Barcode from "@/components/Barcode";

export default function InventoryPage() {
    const { products, addProduct, updateProduct, deleteProduct } = useInventory();

    // Search & Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [productType, setProductType] = useState<ProductType | 'all'>('all');
    const [stockStatus, setStockStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'updated'>('updated');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // New product form state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'barcode' | 'createdAt' | 'updatedAt'>>({
        name: '',
        type: 'phone',
        brand: '',
        model: '',
        storage: '',
        color: '',
        purchasePrice: 0,
        sellingPrice: 0,
        stock: 0
    });

    // Product to edit
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);

    // Apply filters
    let filteredProducts = products;

    if (searchQuery) {
        filteredProducts = searchProducts(filteredProducts, searchQuery);
    }

    filteredProducts = filterProductsByType(filteredProducts, productType);
    filteredProducts = filterProductsByStock(filteredProducts, stockStatus);
    filteredProducts = sortProducts(filteredProducts, sortBy, sortOrder);

    // Handle adding a new product
    const handleAddProduct = () => {
        try {
            addProduct(newProduct);
            setNewProduct({
                name: '',
                type: 'phone',
                brand: '',
                model: '',
                storage: '',
                color: '',
                purchasePrice: 0,
                sellingPrice: 0,
                stock: 0
            });
            setIsAddDialogOpen(false);
            toast.success("تمت إضافة المنتج بنجاح");
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error("فشل إضافة المنتج");
        }
    };

    // Handle editing a product
    const handleEditProduct = () => {
        if (!productToEdit) return;

        try {
            updateProduct(productToEdit.id, productToEdit);
            setProductToEdit(null);
            setIsEditDialogOpen(false);
            toast.success("تم تحديث المنتج بنجاح");
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("فشل تحديث المنتج");
        }
    };

    // Handle delete product
    const handleDeleteProduct = (id: string) => {
        if (window.confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟")) {
            try {
                deleteProduct(id);
                toast.success("تم حذف المنتج بنجاح");
            } catch (error) {
                console.error("Error deleting product:", error);
                toast.error("فشل حذف المنتج");
            }
        }
    };

    // Update new product field
    const updateNewProductField = (field: keyof typeof newProduct, value: any) => {
        setNewProduct({
            ...newProduct,
            [field]: value
        });
    };

    // Update product to edit field
    const updateProductToEditField = (field: keyof Product, value: any) => {
        if (!productToEdit) return;

        setProductToEdit({
            ...productToEdit,
            [field]: value
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">المخزون</h2>
                    <p className="text-muted-foreground mt-1">
                        إدارة المنتجات والمخزون الخاص بك.
                    </p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            إضافة منتج
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>إضافة منتج جديد</DialogTitle>
                            <DialogDescription>
                                أدخل تفاصيل المنتج الجديد. انقر فوق حفظ عند الانتهاء.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product-type">نوع المنتج</Label>
                                    <Select
                                        value={newProduct.type}
                                        onValueChange={(value: ProductType) => updateNewProductField('type', value)}
                                    >
                                        <SelectTrigger id="product-type">
                                            <SelectValue placeholder="اختر النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="phone">هاتف</SelectItem>
                                            <SelectItem value="tablet">جهاز لوحي</SelectItem>
                                            <SelectItem value="accessory">ملحق</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">كمية المخزون</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        value={newProduct.stock}
                                        onChange={(e) => updateNewProductField('stock', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">اسم المنتج</Label>
                                <Input
                                    id="name"
                                    value={newProduct.name}
                                    onChange={(e) => updateNewProductField('name', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="brand">العلامة التجارية</Label>
                                    <Input
                                        id="brand"
                                        value={newProduct.brand}
                                        onChange={(e) => updateNewProductField('brand', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="model">الموديل</Label>
                                    <Input
                                        id="model"
                                        value={newProduct.model}
                                        onChange={(e) => updateNewProductField('model', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="storage">التخزين</Label>
                                    <Input
                                        id="storage"
                                        value={newProduct.storage}
                                        onChange={(e) => updateNewProductField('storage', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">اللون</Label>
                                    <Input
                                        id="color"
                                        value={newProduct.color}
                                        onChange={(e) => updateNewProductField('color', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchase-price">سعر الشراء</Label>
                                    <Input
                                        id="purchase-price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newProduct.purchasePrice}
                                        onChange={(e) => updateNewProductField('purchasePrice', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="selling-price">سعر البيع</Label>
                                    <Input
                                        id="selling-price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newProduct.sellingPrice}
                                        onChange={(e) => updateNewProductField('sellingPrice', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                إلغاء
                            </Button>
                            <Button onClick={handleAddProduct}>
                                إضافة منتج
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>تعديل المنتج</DialogTitle>
                            <DialogDescription>
                                قم بتحديث تفاصيل المنتج وانقر فوق حفظ عند الانتهاء.
                            </DialogDescription>
                        </DialogHeader>

                        {productToEdit && (
                            <>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-product-type">نوع المنتج</Label>
                                            <Select
                                                value={productToEdit.type}
                                                onValueChange={(value: ProductType) => updateProductToEditField('type', value)}
                                            >
                                                <SelectTrigger id="edit-product-type">
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="phone">هاتف</SelectItem>
                                                    <SelectItem value="tablet">جهاز لوحي</SelectItem>
                                                    <SelectItem value="accessory">ملحق</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-stock">كمية المخزون</Label>
                                            <Input
                                                id="edit-stock"
                                                type="number"
                                                min="0"
                                                value={productToEdit.stock}
                                                onChange={(e) => updateProductToEditField('stock', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name">اسم المنتج</Label>
                                        <Input
                                            id="edit-name"
                                            value={productToEdit.name}
                                            onChange={(e) => updateProductToEditField('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-brand">العلامة التجارية</Label>
                                            <Input
                                                id="edit-brand"
                                                value={productToEdit.brand}
                                                onChange={(e) => updateProductToEditField('brand', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-model">الموديل</Label>
                                            <Input
                                                id="edit-model"
                                                value={productToEdit.model}
                                                onChange={(e) => updateProductToEditField('model', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-storage">التخزين</Label>
                                            <Input
                                                id="edit-storage"
                                                value={productToEdit.storage}
                                                onChange={(e) => updateProductToEditField('storage', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-color">اللون</Label>
                                            <Input
                                                id="edit-color"
                                                value={productToEdit.color}
                                                onChange={(e) => updateProductToEditField('color', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-purchase-price">سعر الشراء</Label>
                                            <Input
                                                id="edit-purchase-price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={productToEdit.purchasePrice}
                                                onChange={(e) => updateProductToEditField('purchasePrice', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-selling-price">سعر البيع</Label>
                                            <Input
                                                id="edit-selling-price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={productToEdit.sellingPrice}
                                                onChange={(e) => updateProductToEditField('sellingPrice', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-center py-2">
                                        <Barcode value={productToEdit.barcode} size="lg" />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                        إلغاء
                                    </Button>
                                    <Button onClick={handleEditProduct}>
                                        حفظ التغييرات
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ابحث عن المنتجات..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SortAsc className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="الترتيب حسب" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">الاسم</SelectItem>
                            <SelectItem value="price">السعر</SelectItem>
                            <SelectItem value="stock">المخزون</SelectItem>
                            <SelectItem value="updated">آخر تحديث</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        className="w-10 p-0"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Select value={productType} onValueChange={(value: any) => setProductType(value)}>
                        <SelectTrigger>
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="النوع" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center">
                                    <Package className="h-4 w-4 mr-2" />
                                    جميع الأنواع
                                </div>
                            </SelectItem>
                            <SelectItem value="phone">
                                <div className="flex items-center">
                                    <Smartphone className="h-4 w-4 mr-2" />
                                    هواتف
                                </div>
                            </SelectItem>
                            <SelectItem value="tablet">
                                <div className="flex items-center">
                                    <Tablet className="h-4 w-4 mr-2" />
                                    أجهزة لوحية
                                </div>
                            </SelectItem>
                            <SelectItem value="accessory">
                                <div className="flex items-center">
                                    <Headphones className="h-4 w-4 mr-2" />
                                    إكسسوارات
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={stockStatus} onValueChange={(value: any) => setStockStatus(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="المخزون" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">كل المخزون</SelectItem>
                            <SelectItem value="in-stock">في المخزون</SelectItem>
                            <SelectItem value="low-stock">مخزون منخفض</SelectItem>
                            <SelectItem value="out-of-stock">نفاد المخزون</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/30 rounded-lg">
                    <Package className="h-12 w-12 text-muted-foreground opacity-20" />
                    <h3 className="mt-4 font-medium text-muted-foreground">لم يتم العثور على منتجات</h3>
                    <p className="text-sm text-muted-foreground">
                        حاول تغيير معايير البحث أو التصفية.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={(product) => {
                                setProductToEdit(product);
                                setIsEditDialogOpen(true);
                            }}
                            onDelete={handleDeleteProduct}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};