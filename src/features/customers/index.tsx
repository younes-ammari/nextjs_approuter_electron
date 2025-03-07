
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/services/inventoryService";
import { formatDate } from "@/services/salesService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, User, Phone, MapPin, ShoppingBag, Edit, Trash, Receipt } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import InvoicePreviewDialog from "@/components/InvoicePreviewDialog";
import { toast } from "sonner";

export default function CustomersPage() {
    const { customers, addCustomer, updateCustomer, deleteCustomer, sales, products } = useInventory();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteSalesWithCustomer, setDeleteSalesWithCustomer] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        phone: "",
        address: ""
    });
    const [editingCustomer, setEditingCustomer] = useState({
        name: "",
        phone: "",
        address: ""
    });

    // Filter customers based on search query
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    // Handle adding a new customer
    const handleAddCustomer = () => {
        if (!newCustomer.name || !newCustomer.phone) {
            return;
        }

        addCustomer({
            name: newCustomer.name,
            phone: newCustomer.phone,
            address: newCustomer.address
        });

        toast.success("Customer added successfully");

        // Reset form
        setNewCustomer({
            name: "",
            phone: "",
            address: ""
        });

        setIsAddCustomerOpen(false);
    };

    // Handle editing a customer
    const handleEditClick = (customer: typeof customers[0]) => {
        setSelectedCustomerId(customer.id);
        setEditingCustomer({
            name: customer.name,
            phone: customer.phone,
            address: customer.address
        });
        setIsEditCustomerOpen(true);
    };

    const handleUpdateCustomer = () => {
        if (!selectedCustomerId || !editingCustomer.name || !editingCustomer.phone) {
            return;
        }

        updateCustomer(selectedCustomerId, {
            name: editingCustomer.name,
            phone: editingCustomer.phone,
            address: editingCustomer.address
        });

        toast.success("Customer updated successfully");
        setIsEditCustomerOpen(false);
    };

    // Handle deleting a customer
    const handleDeleteClick = (customerId: string) => {
        setSelectedCustomerId(customerId);
        setDeleteSalesWithCustomer(false);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteCustomer = () => {
        if (!selectedCustomerId) return;

        deleteCustomer(selectedCustomerId, deleteSalesWithCustomer);

        toast.success("Customer deleted successfully");
        setIsDeleteDialogOpen(false);
    };

    // Handle viewing invoice
    const handleViewInvoice = (invoiceId: string) => {
        setSelectedInvoiceId(invoiceId);
        setIsInvoicePreviewOpen(true);
    };

    // Get customer purchase history
    const getCustomerPurchases = (customerId: string) => {
        return sales.filter(sale => sale.customerId === customerId);
    };

    // Calculate total spent by customer
    const getTotalSpent = (customerId: string) => {
        const customerSales = getCustomerPurchases(customerId);
        return customerSales.reduce((total, sale) => total + sale.finalTotal, 0);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your customer database and view purchase history
                    </p>
                </div>
                <Button onClick={() => setIsAddCustomerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                </Button>
            </div>

            <div className="flex mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCustomers.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        <User className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                        <h3 className="mt-4 font-medium text-muted-foreground">No customers found</h3>
                        <p className="text-sm text-muted-foreground">
                            Try a different search or add a new customer.
                        </p>
                    </div>
                ) : (
                    filteredCustomers.map(customer => {
                        const customerPurchases = getCustomerPurchases(customer.id);
                        const totalSpent = getTotalSpent(customer.id);

                        return (
                            <Card key={customer.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{customer.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {customer.phone}
                                            </CardDescription>
                                        </div>
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditClick(customer)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(customer.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <span>{customer.address || "No address provided"}</span>
                                    </div>

                                    <div className="border-t pt-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">Total Purchases:</span>
                                            <span className="font-medium">{customerPurchases.length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Total Spent:</span>
                                            <span className="font-medium">{formatCurrency(totalSpent)}</span>
                                        </div>
                                    </div>

                                    {customerPurchases.length > 0 && (
                                        <div className="border-t pt-3">
                                            <h4 className="text-sm font-medium mb-2">Recent Purchases</h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {customerPurchases
                                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                    .slice(0, 3)
                                                    .map(sale => (
                                                        <div
                                                            key={sale.id}
                                                            className="text-xs border rounded-md p-2 hover:bg-muted/50 cursor-pointer"
                                                            onClick={() => handleViewInvoice(sale.id)}
                                                        >
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-muted-foreground">
                                                                    {formatDate(sale.createdAt)}
                                                                </span>
                                                                <span className="font-medium">
                                                                    {formatCurrency(sale.finalTotal)}
                                                                </span>
                                                            </div>
                                                            <div className="text-muted-foreground flex items-center">
                                                                <Receipt className="h-3 w-3 mr-1" />
                                                                {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Add Customer Sheet */}
            <Sheet open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Add New Customer</SheetTitle>
                        <SheetDescription>
                            Add a new customer to your database. Fill in the details below.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="(555) 123-4567"
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="123 Main St, City, Country"
                                value={newCustomer.address}
                                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <SheetFooter>
                        <Button onClick={handleAddCustomer} disabled={!newCustomer.name || !newCustomer.phone}>
                            Add Customer
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Edit Customer Sheet */}
            <Sheet open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Edit Customer</SheetTitle>
                        <SheetDescription>
                            Update customer information.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                                id="edit-name"
                                placeholder="John Doe"
                                value={editingCustomer.name}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Phone Number</Label>
                            <Input
                                id="edit-phone"
                                placeholder="(555) 123-4567"
                                value={editingCustomer.phone}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input
                                id="edit-address"
                                placeholder="123 Main St, City, Country"
                                value={editingCustomer.address}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <SheetFooter>
                        <Button
                            onClick={handleUpdateCustomer}
                            disabled={!editingCustomer.name || !editingCustomer.phone}
                        >
                            Update Customer
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Delete Customer Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this customer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone.
                            {customers.find(c => selectedCustomerId !== null && c.id === selectedCustomerId)?.purchases?.length! > 0 && (
                                <div className="mt-2 p-2 bg-muted rounded-md">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={deleteSalesWithCustomer}
                                            onChange={(e) => setDeleteSalesWithCustomer(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span>
                                            Also delete all sales associated with this customer?
                                            ({customers.find(c => c.id === selectedCustomerId)?.purchases.length ?? 0} sales)
                                        </span>
                                    </label>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCustomer}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
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
