
import React, { useEffect, useState } from 'react';
import { Product, Order, Stats } from '@/types';
import { Package, Users, DollarSign, Truck, Clock, PackageCheck, PackageX,Send,Loader } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
} from '@/components/ui/chart';
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart,
  Line,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { getStatusColor } from './AdminUtils';
import {  authApi, orderApi, productApi } from '@/services/apiService';
import { set } from 'date-fns';
import { parseISO, format, getWeek, getMonth, getYear,isValid  } from 'date-fns';
interface DashboardOverviewProps {
  stats: Stats;
  displayOrders: Order[];
  products: Product[];
  isLoadingOrders: boolean;
  useMockData: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  stats, 
  displayOrders, 
  products, 
  isLoadingOrders, 
  useMockData 
}) => {
  const [localStats, setLocalStats] = useState<Stats>(stats);
  const [topproduct, settopproduct] = useState<Product[]>(products);
  const [topOrders, setTopOrders] = useState<Order[]>(displayOrders);
  const [chartType, setChartType] = useState<'bar' | 'line'>('line');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'annually'>('daily');
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsproduct = await productApi.getDashboard();
        //console.log('statsproduct:', statsproduct);

        const statsorder = await orderApi.getDashboard();
        //console.log('statsorder:', statsorder);

        const statsuser = await authApi.getDashboard();

        //console.log('statsuser', statsuser);

        setLocalStats({
          totalSales: statsorder.totalSales,
          totalOrders: statsorder.totalOrders,
          totalUsers: statsuser.totalUsers,
          totalProducts: statsproduct.totalProducts,
          recentSales: statsorder.recentSales,
          pendingOrders: statsorder.pendingOrders,
          deliveredOrders: statsorder.deliveredOrders,
          canceledOrders: statsorder.canceledOrders,
          processingOrders: statsorder.processingOrders,
          shippedOrders: statsorder.shippedOrders,
        });
        settopproduct(statsorder.topProducts);
       // console.log('topproduct:', statsorder.topProducts);
        setTopOrders(statsorder.top5RecentOrders);
        //console.log('topOrders:', statsorder.top5RecentOrders);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };


    fetchStats();
  
  }, []);
  const getTimeframedData = () => {
    const sales = localStats.recentSales;
  
    const grouped: Record<string, number> = {};
  
    sales.forEach(({ date, amount }) => {
    if (!date) return;
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) return;
    
      let key = '';
  
      switch (timeframe) {
        case 'weekly':
          key = `Week ${getWeek(parsedDate)}`;
          break;
        case 'monthly':
          key = format(parsedDate, 'MMM'); // "Jan", "Feb", etc.
          break;
        case 'annually':
          key = getYear(parsedDate).toString();
          break;
        default:
          key = format(parsedDate, 'yyyy-MM-dd'); // daily
      }
  
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += amount;
    });
  
    // Convert the grouped object to array format
    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  };

  const chartData = getTimeframedData();
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-muted-foreground mb-1 text-sm">Products</h3>
            <p className="text-3xl font-bold">{!localStats.totalProducts ? 0 : localStats.totalProducts}</p>
          </div>
          <Package className="w-6 h-6 text-gray-400" />
        </div>
      </div>

        <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm">Total Users</h3>
          <p className="text-3xl font-bold">{localStats.totalUsers?0:localStats.totalUsers}</p>
          </div>
          <Users className="w-6 h-6 text-gray-400" />
          </div>
        </div>


        <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm">Total Sales</h3>
          <p className="text-3xl font-bold">${!localStats.totalSales?0:localStats.totalSales}</p>
          </div>
          <DollarSign className="w-6 h-6 text-gray-400" />
            </div>
        </div>




        <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm">Total Orders</h3>
          <p className="text-3xl font-bold">{!localStats.totalOrders?0:localStats.totalOrders}</p>
          </div>
          <Truck className="w-6 h-6 text-gray-400" />
        </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm">Total Pending Orders</h3>
          <p className="text-3xl font-bold">{!localStats.pendingOrders?0:localStats.pendingOrders}</p>
          </div>
          <Clock className="w-6 h-6 text-gray-400" />
        </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm">Total Processing Orders</h3>
          <p className="text-3xl font-bold">{!localStats.processingOrders?0:localStats.processingOrders}</p>
          </div>
          <Loader className="w-6 h-6 text-gray-400" />
        </div>
        </div>


        <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm">Total Shipped Orders</h3>
          <p className="text-3xl font-bold">{!localStats.shippedOrders?0:localStats.shippedOrders}</p>
          </div>
          <Send className="w-6 h-6 text-gray-400" />
        </div>
        </div>


        <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm">Total Delivered Orders</h3>
          <p className="text-3xl font-bold">{!localStats.deliveredOrders ? 0 :localStats.deliveredOrders }</p>
          </div>
          <PackageCheck className="w-6 h-6 text-gray-400" />
        </div>
        </div>

        
        <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm">Total Cancelled Orders</h3>
          <p className="text-3xl font-bold">{!localStats.canceledOrders? 0:localStats.canceledOrders}</p>
        </div>
        <PackageX className="w-6 h-6 text-gray-400" />
        </div>
        </div>
        </div>
      
      
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-7xl h-[770px]">
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Sales Chart</h3>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-input overflow-hidden">
              <Button 
                variant={chartType === 'bar' ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType('bar')}
                className="h-8 rounded-none"
              >
                Bar
              </Button>
              <Button 
                variant={chartType === 'line' ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-8 rounded-none"
              >
                Line
              </Button>
            </div>
            
            <div className="flex items-center rounded-lg border border-input overflow-hidden">
              <Button 
                variant={timeframe === 'daily' ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe('daily')}
                className="h-8 rounded-none"
              >
                Daily
              </Button>
              <Button 
                variant={timeframe === 'weekly' ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe('weekly')}
                className="h-8 rounded-none"
              >
                Weekly
              </Button>
              <Button 
                variant={timeframe === 'monthly' ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe('monthly')}
                className="h-8 rounded-none"
              >
                Monthly
              </Button>
              <Button 
                variant={timeframe === 'annually' ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe('annually')}
                className="h-8 rounded-none"
              >
                Annually
              </Button>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ChartContainer
            config={{
              sales: {
                label: "Sales",
                theme: {
                  light: "hsl(var(--primary))",
                  dark: "hsl(var(--primary))",
                },
              },
            }}
          >
            
            {/* <BarChart data={localStats.recentSales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Day
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].payload.date}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Sales
                            </span>
                            <span className="font-bold">
                              ${payload[0].payload.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="amount"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>*/}
            {chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {timeframe === 'daily' ? 'Day' : timeframe === 'weekly' ? 'Week' : timeframe === 'monthly' ? 'Month' : 'Year'}
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.date}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Sales
                              </span>
                              <span className="font-bold">
                                ${payload[0].payload.amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {timeframe === 'daily' ? 'Day' : timeframe === 'weekly' ? 'Week' : timeframe === 'monthly' ? 'Month' : 'Year'}
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.date}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Sales
                              </span>
                              <span className="font-bold">
                                {payload[0].payload.amount.toFixed(2)}₪
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ChartContainer> 
          
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                { topOrders ? (
                  topOrders.map((order) => (
                    <TableRow key={order.id2}>
                      <TableCell>#{order.id2}</TableCell>
                      <TableCell>{order.userName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Top Products</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                
                {topproduct.map((product) => (
                  <TableRow key={product.id1}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
