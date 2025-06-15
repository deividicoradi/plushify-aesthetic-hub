
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
      sku: initialData?.sku || "",
      price: initialData?.price || 0,
      cost_price: initialData?.cost_price || 0,
      stock_quantity: initialData?.stock_quantity || 0,
      min_stock_level: initialData?.min_stock_level || 0,
      category: initialData?.category || "",
      brand: initialData?.brand || "",
      barcode: initialData?.barcode || "",
      active: initialData?.active ?? true,
    },
  });

  const activeValue = watch("active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            {...register("name", { required: "Nome é obrigatório" })}
            placeholder="Ex: Shampoo Anti-Caspa"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            {...register("sku")}
            placeholder="Ex: SH001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_price">Custo por Unidade *</Label>
          <Input
            id="cost_price"
            type="number"
            step="0.01"
            {...register("cost_price", {
              required: "Custo é obrigatório",
              min: { value: 0, message: "Custo deve ser positivo" }
            })}
            placeholder="0.00"
          />
          {errors.cost_price && (
            <p className="text-sm text-red-500">{errors.cost_price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Valor de Referência</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", {
              min: { value: 0, message: "Valor deve ser positivo" }
            })}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Quantidade em Estoque *</Label>
          <Input
            id="stock_quantity"
            type="number"
            {...register("stock_quantity", { 
              required: "Quantidade é obrigatória",
              min: { value: 0, message: "Quantidade deve ser positiva" }
            })}
            placeholder="0"
          />
          {errors.stock_quantity && (
            <p className="text-sm text-red-500">{errors.stock_quantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_stock_level">Estoque Mínimo</Label>
          <Input
            id="min_stock_level"
            type="number"
            {...register("min_stock_level", {
              min: { value: 0, message: "Estoque mínimo deve ser positivo" }
            })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            {...register("category")}
            placeholder="Ex: Cabelo, Pele, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            {...register("brand")}
            placeholder="Ex: L'Oréal, Garnier, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input
            id="barcode"
            {...register("barcode")}
            placeholder="Ex: 1234567890123"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={activeValue}
              onCheckedChange={(checked) => setValue("active", checked)}
            />
            <Label htmlFor="active">Produto Ativo</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Descrição detalhada do produto..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Produto"}
        </Button>
      </div>
    </form>
  );
};
