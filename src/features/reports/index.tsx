
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { calculateTotalRevenue, calculateTotalProfit, getSalesByDay } from "@/services/salesService";
import { filterProductsByStock } from "@/services/inventoryService";
import { formatCurrency } from "@/services/inventoryService";
import { BarChart2, CircleDollarSign, Package } from "lucide-react";

export default function ReportsPage() {
    const { products, sales } = useInventory();
    const [activeTab, setActiveTab] = useState("sales");

    // Calculate summary data
    const totalRevenue = calculateTotalRevenue(sales);
    const totalProfit = calculateTotalProfit(sales, products);
    const salesByDay = getSalesByDay(sales, 7);

    // Stock status counts
    const inStock = filterProductsByStock(products, "in-stock").length;
    const lowStock = filterProductsByStock(products, "low-stock").length;
    const outOfStock = filterProductsByStock(products, "out-of-stock").length;

    // Stock distribution data for pie chart
    const stockData = [
        { name: "In Stock", value: inStock, color: "#22c55e" },
        { name: "Low Stock", value: lowStock, color: "#f97316" },
        { name: "Out of Stock", value: outOfStock, color: "#ef4444" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                <p className="text-muted-foreground mt-1">
                    View sales, inventory, and profit reports.
                </p>
            </div>

            <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="sales" className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        <span>Sales Report</span>
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Inventory Report</span>
                    </TabsTrigger>
                    <TabsTrigger value="profit" className="flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4" />
                        <span>Profit Report</span>
                    </TabsTrigger>
                </TabsList>

                {/* Sales Report Tab */}
                <TabsContent value="sales" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Sales
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">
                                    {sales.length}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Revenue
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">
                                    {formatCurrency(totalRevenue)}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Average Sale Value
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">
                                    {sales.length ? formatCurrency(totalRevenue / sales.length) : formatCurrency(0)}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesByDay}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                                        <Bar dataKey="total" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Report Tab */}
                <TabsContent value="inventory" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className={inStock > 0 ? "border-green-500 border-l-4" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    In Stock Products
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">
                                    {inStock}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className={lowStock > 0 ? "border-orange-500 border-l-4" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Low Stock Products
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">
                                    {lowStock}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className={outOfStock > 0 ? "border-red-500 border-l-4" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Out of Stock Products
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">
                                    {outOfStock}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stockData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={120}
                                            label={(entry) => `${entry.name}: ${entry.value}`}
                                        >
                                            {stockData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [value, "Items"]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Profit Report Tab */}
                <TabsContent value="profit" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Revenue
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">
                                    {formatCurrency(totalRevenue)}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Profit
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">
                                    {formatCurrency(totalProfit)}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Profit Margin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center h-60">
                                <div className="text-5xl font-bold">
                                    {totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%
                                </div>
                                <p className="text-muted-foreground mt-2">Overall Profit Margin</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};