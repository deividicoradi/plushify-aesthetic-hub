
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ProductFormData, Product } from "@/hooks/inventory/useProductsData";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product;
  isLoading?: boolean;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  initialData,
  isLoading,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      cost_price: initialData?.cost_price || 0,
      stock_quantity: initialData?.stock_quantity || 0,
      min_stock_level: initialData?.min_stock_level || 0,
      category: initialData?.category || "",
      brand: initialData?.brand || "",
      active: initialData?.active ?? true,
    },
  });

  const activeValue = watch("active");

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Nome do Produto *</Label>
            <Input
              id="name"
              {...register("name", { required: "Nome é obrigatório" })}
              placeholder="Ex: Shampoo Anti-Caspa"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500"
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_price" className="text-white">Custo por Unidade *</Label>
            <Input
              id="cost_price"
              type="number"
              step="0.01"
              {...register("cost_price", {
                required: "Custo é obrigatório",
                min: { value: 0, message: "Custo deve ser positivo" }
              })}
              placeholder="0"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500"
            />
            {errors.cost_price && (
              <p className="text-sm text-red-400">{errors.cost_price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-white">Valor de Referência</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", {
                min: { value: 0, message: "Valor deve ser positivo" }
              })}
              placeholder="0"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500"
            />
            {errors.price && (
              <p className="text-sm text-red-400">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_quantity" className="text-white">Quantidade em Estoque *</Label>
            <Input
              id="stock_quantity"
              type="number"
              {...register("stock_quantity", { 
                required: "Quantidade é obrigatória",
                min: { value: 0, message: "Quantidade deve ser positiva" }
              })}
              placeholder="0"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500"
            />
            {errors.stock_quantity && (
              <p className="text-sm text-red-400">{errors.stock_quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_stock_level" className="text-white">Estoque Mínimo</Label>
            <Input
              id="min_stock_level"
              type="number"
              {...register("min_stock_level", {
                min: { value: 0, message: "Estoque mínimo deve ser positivo" }
              })}
              placeholder="0"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">Categoria</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Ex: Cabelo, Pele, etc."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand" className="text-white">Marca</Label>
            <Input
              id="brand"
              {...register("brand")}
              placeholder="Ex: L'Oréal, Garnier, etc."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Switch
                id="active"
                checked={activeValue}
                onCheckedChange={(checked) => setValue("active", checked)}
                className="data-[state=checked]:bg-pink-600"
              />
              <Label htmlFor="active" className="text-white">Produto Ativo</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">Descrição</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrição detalhada do produto..."
            rows={3}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Produto"}
          </Button>
        </div>
      </form>
    </div>
  );
};
