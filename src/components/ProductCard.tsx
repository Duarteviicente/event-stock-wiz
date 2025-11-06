import { Product } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const isLowStock = product.minStock && product.currentStock <= product.minStock;
  
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{product.name}</CardTitle>
          </div>
          {isLowStock && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Baixo
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {product.currentStock}
          </span>
          <span className="text-muted-foreground">{product.unit}</span>
        </div>
        {product.minStock && (
          <p className="text-sm text-muted-foreground mt-2">
            Mínimo: {product.minStock} {product.unit}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
