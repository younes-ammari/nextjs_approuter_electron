import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SalesForm from "@/components/SalesForm";
import { formatDate } from "@/services/salesService";
import { formatCurrency } from "@/services/inventoryService";
import { Receipt, ArrowRight, Edit, Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import InvoicePreviewDialog from "@/components/InvoicePreviewDialog";
import { toast } from "sonner";
import Link from "next/link";

export default function SalesPage() {
    const { sales, products, deleteSale } = useInventory();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
    const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

    // Get the 5 most recent sales
    const recentSales = [...sales]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    // Handle viewing invoice
    const handleViewInvoice = (saleId: string) => {
        setSelectedInvoiceId(saleId);
        setIsInvoicePreviewOpen(true);
    };

    // Handle deleting an invoice
    const handleDeleteClick = (saleId: string) => {
        setSelectedSaleId(saleId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteSale = () => {
        if (!selectedSaleId) return;

        deleteSale(selectedSaleId);
        toast.success("تم حذف البيع بنجاح");
        setIsDeleteDialogOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">المبيعات</h2>
                    <p className="text-muted-foreground mt-1">
                        أنشئ مبيعات جديدة وعرض المعاملات الأخيرة.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/sales-history">
                        عرض جميع المبيعات
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="col-span-3">
                    <SalesForm />
                </div>

                <div className="lg:col-span-3">
                    <Card className="shadow-md">
                        <CardHeader className="px-6">
                            <CardTitle className="text-xl">المبيعات الأخيرة</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6">
                            {recentSales.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <Receipt className="h-12 w-12 text-muted-foreground opacity-20" />
                                    <h3 className="mt-4 font-medium text-muted-foreground">لم يتم العثور على مبيعات</h3>
                                    <p className="text-sm text-muted-foreground">
                                        أنشئ عملية بيع جديدة لرؤيتها هنا.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentSales.map((sale) => (
                                        <div
                                            key={sale.id}
                                            className="border rounded-lg overflow-hidden hover:border-muted-foreground/20 transition-colors"
                                        >
                                            <div className="bg-muted/30 px-4 py-2 border-b flex justify-between items-center">
                                                <div
                                                    className="flex items-center cursor-pointer"
                                                    onClick={() => handleViewInvoice(sale.id)}
                                                >
                                                    <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <span className="font-medium">فاتورة #{sale.id}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(sale.createdAt)}
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => handleViewInvoice(sale.id)}
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => handleDeleteClick(sale.id)}
                                                        >
                                                            <Trash className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2">
                                                <div className="space-y-1">
                                                    {sale.items.map((item, index) => {
                                                        const product = products.find(p => p.id === item.productId);
                                                        return (
                                                            <div key={index} className="flex justify-between text-sm">
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
                                                <div className="flex justify-between mt-2 pt-2 border-t font-medium">
                                                    <div>الإجمالي</div>
                                                    <div>{formatCurrency(sale.finalTotal)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Sale Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد أنك تريد حذف هذا البيع؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            لا يمكن التراجع عن هذا الإجراء. سيتم إرجاع العناصر الموجودة في هذا البيع إلى المخزون.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSale}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Invoice Preview Dialog */}
            <InvoicePreviewDialog
                saleId={selectedInvoiceId}
                open={isInvoicePreviewOpen}
                onOpenChange={setIsInvoicePreviewOpen}
            />
        </div>
    );
};