
import React from "react";
import { PackageOpen, Archive, Boxes } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const INVENTORY_STATS = [
  {
    label: "Produtos Ativos",
    value: 85,
    icon: <PackageOpen className="w-7 h-7 text-plush-600" />,
    color: "bg-plush-50 text-plush-700"
  },
  {
    label: "Baixo Estoque",
    value: 8,
    icon: <Archive className="w-7 h-7 text-accent2-600" />,
    color: "bg-accent2-50 text-accent2-700"
  },
  {
    label: "Categorias",
    value: 14,
    icon: <Boxes className="w-7 h-7 text-primary" />,
    color: "bg-primary/10 text-primary"
  }
];

const PRODUCTS = [
  {
    name: "Shampoo Reconstrução",
    category: "Higiene",
    stock: 14,
    minStock: 5,
    status: "OK"
  },
  {
    name: "Sabonete Calmante",
    category: "Cosmético",
    stock: 4,
    minStock: 10,
    status: "Crítico"
  },
  {
    name: "Ampola Nutritiva",
    category: "Tratamento",
    stock: 18,
    minStock: 8,
    status: "OK"
  },
  {
    name: "Máscara Hidratante",
    category: "Cosmético",
    stock: 3,
    minStock: 6,
    status: "Crítico"
  },
  {
    name: "Condicionador Suave",
    category: "Higiene",
    stock: 25,
    minStock: 7,
    status: "OK"
  }
];

const Inventory = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        {/* Conteúdo Principal */}
        <main>
          {/* Header */}
          <div className="flex items-center gap-3 mb-7 animate-fade-in">
            <Boxes className="w-9 h-9 text-plush-600 animate-float" />
            <h1 className="text-3xl md:text-4xl font-extrabold font-serif gradient-text tracking-tight">
              Estoque
            </h1>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap gap-5 mb-10">
            {INVENTORY_STATS.map((stat) => (
              <Card className={`flex-1 min-w-[170px] p-0 rounded-xl shadow-lg border-0 ${stat.color} animate-scale-in`} key={stat.label}>
                <CardContent className="flex items-center gap-4 py-6 px-6">
                  <div className="rounded-full p-3 bg-white/70 shadow-sm">{stat.icon}</div>
                  <div>
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-sm font-semibold opacity-70">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Tabela de Estoque */}
          <Card className="rounded-2xl shadow-xl border-0 bg-white/80 dark:bg-card mb-10 animate-fade-in delay-100">
            <CardHeader className="p-6 pb-3 border-b border-muted/30">
              <CardTitle className="text-xl font-serif text-plush-700">Produtos em Estoque</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Estoque Mínimo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PRODUCTS.map((prod) => (
                    <TableRow key={prod.name} className="hover:bg-plush-50/40 transition">
                      <TableCell>
                        <span className="font-bold">{prod.name}</span>
                      </TableCell>
                      <TableCell>{prod.category}</TableCell>
                      <TableCell className="text-center font-mono">{prod.stock}</TableCell>
                      <TableCell className="text-center">{prod.minStock}</TableCell>
                      <TableCell className="text-center">
                        {prod.status === "OK" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">OK</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 animate-pulse">{prod.status}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
        {/* Banner/Visual Lateral */}
        <aside className="hidden lg:block">
          <div className="rounded-2xl bg-gradient-to-br from-plush-50 via-accent2-50 to-white/90 p-2 shadow-lg glass-morphism animate-fade-in delay-200">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
              alt="Visual Estoque"
              className="w-full h-[360px] object-cover object-center rounded-xl shadow"
              loading="lazy"
              draggable={false}
            />
            <div className="p-5 pt-3 text-center">
              <h2 className="text-xl font-serif font-bold mb-2 text-plush-600">Controle total do seu estoque!</h2>
              <p className="text-base text-muted-foreground">
                Tenha todos os produtos na palma da mão, identifique baixos estoques rapidamente e garanta eficiência no seu negócio.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Inventory;
