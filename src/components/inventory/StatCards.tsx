
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
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 text-pink-700">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-white/70 shadow-sm">
            <Package className="w-7 h-7 text-pink-600" />
          </div>
          <div>
            <div className="text-lg font-bold">{total}</div>
            <div className="text-sm font-semibold opacity-70">Produtos Ativos</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-pink-50 text-red-700">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-white/70 shadow-sm">
            <Archive className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <div className="text-lg font-bold">{lowStock}</div>
            <div className="text-sm font-semibold opacity-70">Baixo Estoque</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-white/70 shadow-sm">
            <Boxes className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <div className="text-lg font-bold">{categories}</div>
            <div className="text-sm font-semibold opacity-70">Categorias</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
