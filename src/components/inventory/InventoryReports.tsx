
import React, { useState, useEffect } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
};

type CategoryData = {
  name: string;
  value: number;
  products: number;
};

type StockData = {
  name: string;
  stock: number;
  minStock: number;
};

const COLORS = ['#9b87f5', '#7E69AB', '#D6BCFA', '#E5DEFF', '#F97316', '#0EA5E9', '#D946EF'];

export const InventoryReports = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [reportType, setReportType] = useState<'category' | 'stock'>('category');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('category', { ascending: true });
        
        if (error) throw error;
        
        setProducts(data || []);
        processData(data || []);
      } catch (error: any) {
        toast.error("Erro ao carregar dados para relatórios: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Process data for charts
  const processData = (products: Product[]) => {
    // Process category data
    const categoriesMap = new Map<string, { total: number, count: number }>();
    
    products.forEach(product => {
      const current = categoriesMap.get(product.category) || { total: 0, count: 0 };
      categoriesMap.set(product.category, {
        total: current.total + product.stock,
        count: current.count + 1
      });
    });
    
    const categoryChartData: CategoryData[] = Array.from(categoriesMap.entries()).map(([name, data]) => ({
      name,
      value: data.total,
      products: data.count
    }));
    
    setCategoryData(categoryChartData);
    
    // Process stock data for top 10 products by quantity
    const stockChartData: StockData[] = products
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10)
      .map(product => ({
        name: product.name.length > 15 ? `${product.name.substring(0, 15)}...` : product.name,
        stock: product.stock,
        minStock: product.min_stock
      }));
    
    setStockData(stockChartData);
  };

  const renderCategoryReport = () => (
    <>
      <div className="h-80 w-full">
        <ChartContainer 
          config={{
            category: {
              label: "Categoria",
              theme: {
                light: "#7E69AB",
                dark: "#9b87f5"
              }
            }
          }}
        >
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <ChartTooltip>
              <ChartTooltipContent />
            </ChartTooltip>
          </PieChart>
        </ChartContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {categoryData.map((category, index) => (
          <div key={category.name} className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium truncate">{category.name}</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              <div>Quantidade: {category.value}</div>
              <div>Produtos: {category.products}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderStockReport = () => (
    <div className="h-80 w-full">
      <ChartContainer
        config={{
          stock: {
            label: "Estoque",
            theme: {
              light: "#9b87f5",
              dark: "#9b87f5"
            }
          },
          minStock: {
            label: "Estoque Mínimo",
            theme: {
              light: "#F97316",
              dark: "#F97316"
            }
          }
        }}
      >
        <BarChart data={stockData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="stock" name="Estoque Atual" fill="var(--color-stock, #9b87f5)" />
          <Bar dataKey="minStock" name="Estoque Mínimo" fill="var(--color-minStock, #F97316)" />
          <ChartTooltip>
            <ChartTooltipContent />
          </ChartTooltip>
        </BarChart>
      </ChartContainer>
    </div>
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xl font-serif text-pink-700">Relatórios de Estoque</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-pulse text-purple-600">Carregando relatórios...</div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Select value={reportType} onValueChange={(value) => setReportType(value as 'category' | 'stock')}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecione o tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Por Categoria</SelectItem>
                  <SelectItem value="stock">Por Estoque (Top 10)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              {reportType === 'category' ? renderCategoryReport() : renderStockReport()}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t text-xs text-muted-foreground pt-3">
        Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
      </CardFooter>
    </Card>
  );
};
