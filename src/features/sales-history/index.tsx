
import { useState } from "react";
import { Sale, useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, printInvoice } from "@/services/salesService";
import { formatCurrency } from "@/services/inventoryService";
import { Eye, Printer, Search, Calendar, Receipt, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import Barcode from "@/components/Barcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SalesHistoryPage() {
    const { sales, products, customers } = useInventory();
    const [timeFilter, setTimeFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

    // Filter sales based on selected time filter
    const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);

        // Apply time filter
        if (timeFilter === "today") {
            const today = new Date();
            return saleDate.toDateString() === today.toDateString();
        } else if (timeFilter === "yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return saleDate.toDateString() === yesterday.toDateString();
        } else if (timeFilter === "thisWeek") {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            return saleDate >= startOfWeek;
        } else if (timeFilter === "thisMonth") {
            const today = new Date();
            return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
        } else if (timeFilter === "customRange" && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59);
            return saleDate >= start && saleDate <= end;
        } else if (searchQuery) {
            // Search by invoice ID
            return sale.id.includes(searchQuery);
        }

        // Show all if no filter is applied
        return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get the selected sale
    const selectedSale = selectedSaleId ? sales.find(sale => sale.id === selectedSaleId) : null;

    // Handle printing invoice
    const handlePrintInvoice = (sale: Sale) => {
        printInvoice(sale, products, {
            name: "MobileStock Store",
            address: "123 Mobile Avenue, Techville",
            phone: "(555) 123-4567"
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
                <p className="text-muted-foreground mt-1">
                    View and manage past sales records.
                </p>
            </div>

            <Card className="shadow-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Filter Sales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="time-filter">Time Period</Label>
                            <Select
                                value={timeFilter}
                                onValueChange={setTimeFilter}
                            >
                                <SelectTrigger id="time-filter">
                                    <SelectValue placeholder="Select time period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="yesterday">Yesterday</SelectItem>
                                    <SelectItem value="thisWeek">This Week</SelectItem>
                                    <SelectItem value="thisMonth">This Month</SelectItem>
                                    <SelectItem value="customRange">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {timeFilter === 'customRange' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="start-date"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="end-date"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="search-invoice">Search by Invoice #</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="search-invoice"
                                    placeholder="Enter invoice number"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Sales Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredSales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Receipt className="h-16 w-16 text-muted-foreground opacity-20" />
                            <h3 className="mt-4 text-lg font-medium text-muted-foreground">No sales found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your filters to see more results.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredSales.map((sale) => {
                                const customer = sale.customerId
                                    ? customers.find(c => c.id === sale.customerId)
                                    : null;

                                return (
                                    <div key={sale.id} className="border rounded-lg overflow-hidden">
                                        <div className="bg-muted/30 px-4 py-3 border-b flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <span className="font-medium">Invoice #{sale.id}</span>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {formatDate(sale.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedSaleId(sale.id)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    <span>View</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePrintInvoice(sale)}
                                                >
                                                    <Printer className="h-4 w-4 mr-1" />
                                                    <span>Print</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="px-4 py-3 grid md:grid-cols-3 gap-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer</h4>
                                                <div className="flex items-start space-x-2">
                                                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                    <div>
                                                        {customer ? (
                                                            <>
                                                                <p className="font-medium">{customer.name}</p>
                                                                <p className="text-sm text-muted-foreground">{customer.phone}</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-muted-foreground">Walk-in Customer</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Items</h4>
                                                <div className="text-sm">
                                                    {sale.items.slice(0, 2).map((item, i) => {
                                                        const product = products.find(p => p.id === item.productId);
                                                        return (
                                                            <div key={i} className="flex justify-between">
                                                                <span>
                                                                    {product ? product.name : 'Unknown Product'} x{item.quantity}
                                                                </span>
                                                                <span>{formatCurrency(item.price * item.quantity)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                    {sale.items.length > 2 && (
                                                        <div className="text-muted-foreground">
                                                            +{sale.items.length - 2} more items
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Payment</h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Subtotal:</span>
                                                        <span>{formatCurrency(sale.total)}</span>
                                                    </div>
                                                    {sale.discount > 0 && (
                                                        <div className="flex justify-between">
                                                            <span>Discount:</span>
                                                            <span>-{formatCurrency(sale.discount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between font-medium">
                                                        <span>Total:</span>
                                                        <span>{formatCurrency(sale.finalTotal)}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Paid via: {sale.paymentMethod.replace('_', ' ')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t px-4 py-2 flex justify-center">
                                            <Barcode value={sale.id} size="sm" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sale Details Dialog */}
            <Dialog open={!!selectedSaleId} onOpenChange={(open) => !open && setSelectedSaleId(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Invoice #{selectedSale?.id}</DialogTitle>
                    </DialogHeader>

                    {selectedSale && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Date:</p>
                                    <p>{formatDate(selectedSale.createdAt)}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <Barcode value={selectedSale.id} size="md" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium mb-1">Customer Details</h3>
                                    {selectedSale.customerId ? (
                                        (() => {
                                            const customer = customers.find(c => c.id === selectedSale.customerId);
                                            return customer ? (
                                                <div className="space-y-1">
                                                    <p>{customer.name}</p>
                                                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                                                    <p className="text-sm text-muted-foreground">{customer.address}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Customer data not found</p>
                                            );
                                        })()
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Walk-in Customer</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-medium mb-1">Payment Information</h3>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Payment Method:</span>
                                            <span className="capitalize">{selectedSale.paymentMethod.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Subtotal:</span>
                                            <span>{formatCurrency(selectedSale.total)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Discount:</span>
                                            <span>{formatCurrency(selectedSale.discount)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>Total:</span>
                                            <span>{formatCurrency(selectedSale.finalTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Items</h3>
                                <div className="border rounded-md overflow-hidden">
                                    <div className="grid grid-cols-12 bg-muted/30 text-sm font-medium py-2 px-4">
                                        <div className="col-span-6">Product</div>
                                        <div className="col-span-2 text-right">Price</div>
                                        <div className="col-span-2 text-right">Qty</div>
                                        <div className="col-span-2 text-right">Subtotal</div>
                                    </div>

                                    <div className="divide-y">
                                        {selectedSale.items.map((item, index) => {
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
                                                            'Unknown Product'
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
                                                <span className="w-24 text-sm text-muted-foreground">Subtotal:</span>
                                                <span className="w-24">{formatCurrency(selectedSale.total)}</span>
                                            </div>
                                            <div className="flex justify-end">
                                                <span className="w-24 text-sm text-muted-foreground">Discount:</span>
                                                <span className="w-24">{formatCurrency(selectedSale.discount)}</span>
                                            </div>
                                            <div className="flex justify-end font-medium">
                                                <span className="w-24">Total:</span>
                                                <span className="w-24">{formatCurrency(selectedSale.finalTotal)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedSaleId(null)}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => handlePrintInvoice(selectedSale)}
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Invoice
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

