
import { useInventory } from "@/context/InventoryContext";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/services/inventoryService";
import { getSalesByDay } from "@/services/salesService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity, BarChart3, DollarSign, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    const { products, sales, getTotalSales } = useInventory();

    // Calculate stats
    const totalProducts = products.length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const recentSalesCount = sales.filter(
        s => new Date(s.createdAt).getTime() > Date.now() - 86400000 * 7
    ).length;

    // Sales data for the chart
    const salesData = getSalesByDay(sales, 7);

    // Calculate total inventory value
    const inventoryValue = products.reduce(
        (total, product) => total + (product.purchasePrice * product.stock),
        0
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-1">
                    Welcome to your MobileStock management system.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue (30d)"
                    value={formatCurrency(getTotalSales(30))}
                    icon={<DollarSign className="h-4 w-4 text-primary" />}
                    trend={{ value: 12.5, isPositive: true }}
                />

                <StatsCard
                    title="Recent Sales"
                    value={recentSalesCount}
                    description="Last 7 days"
                    icon={<ShoppingBag className="h-4 w-4 text-primary" />}
                />

                <StatsCard
                    title="Inventory Items"
                    value={totalProducts}
                    icon={<Package className="h-4 w-4 text-primary" />}
                />

                <StatsCard
                    title="Inventory Value"
                    value={formatCurrency(inventoryValue)}
                    icon={<BarChart3 className="h-4 w-4 text-primary" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4 shadow-md">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Daily sales for the past week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        axisLine={{ strokeOpacity: 0.3 }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        axisLine={{ strokeOpacity: 0.3 }}
                                        tickLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`$${value}`, 'Revenue']}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="hsl(var(--primary))"
                                        radius={[4, 4, 0, 0]}
                                        animationDuration={500}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 shadow-md">
                    <CardHeader>
                        <CardTitle>Inventory Alert</CardTitle>
                        <CardDescription>Items that need attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-destructive/10 p-2 rounded-full mr-3">
                                        <Activity className="h-4 w-4 text-destructive" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Out of Stock</p>
                                        <p className="text-sm text-muted-foreground">Items need restocking</p>
                                    </div>
                                </div>
                                <span className="font-bold text-xl">{outOfStockProducts}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-yellow-500/10 p-2 rounded-full mr-3">
                                        <Activity className="h-4 w-4 text-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Low Stock</p>
                                        <p className="text-sm text-muted-foreground">Items running low</p>
                                    </div>
                                </div>
                                <span className="font-bold text-xl">{lowStockProducts}</span>
                            </div>

                            <div className="border-t pt-4 mt-6">
                                <Link
                                    href="/inventory"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                                >
                                    View Inventory
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
