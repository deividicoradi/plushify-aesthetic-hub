
import React from "react";
import { Package, Archive, Boxes } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatsProps = {
  total: number;
  lowStock: number;
  categories: number;
};

export const StatCards = ({ total, lowStock, categories }: StatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-background/70 shadow-sm border border-border">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{total}</div>
            <div className="text-sm font-semibold text-muted-foreground">Produtos Ativos</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-background/70 shadow-sm border border-border">
            <Archive className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{lowStock}</div>
            <div className="text-sm font-semibold text-muted-foreground">Baixo Estoque</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-secondary/30">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-background/70 shadow-sm border border-border">
            <Boxes className="w-7 h-7 text-secondary-foreground" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{categories}</div>
            <div className="text-sm font-semibold text-muted-foreground">Categorias</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
