
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
    <div className="bg-card text-card-foreground p-6 rounded-lg border">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              {...register("name", { required: "Nome é obrigatório" })}
              placeholder="Ex: Shampoo Anti-Caspa"
              className="focus:border-primary focus:ring-primary"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
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
              placeholder="0"
              className="focus:border-primary focus:ring-primary"
            />
            {errors.cost_price && (
              <p className="text-sm text-destructive">{errors.cost_price.message}</p>
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
              placeholder="0"
              className="focus:border-primary focus:ring-primary"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
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
              className="focus:border-primary focus:ring-primary"
            />
            {errors.stock_quantity && (
              <p className="text-sm text-destructive">{errors.stock_quantity.message}</p>
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
              className="focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Ex: Cabelo, Pele, etc."
              className="focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              {...register("brand")}
              placeholder="Ex: L'Oréal, Garnier, etc."
              className="focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Switch
                id="active"
                checked={activeValue}
                onCheckedChange={(checked) => setValue("active", checked)}
                className="data-[state=checked]:bg-primary"
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
            className="focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Produto"}
          </Button>
        </div>
      </form>
    </div>
  );
};
