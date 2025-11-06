import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Product, Event } from "@/types/inventory";

interface AllocateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  events: Event[];
  onAllocate: (allocation: {
    eventId: string;
    productId: string;
    allocatedQuantity: number;
  }) => void;
}

export function AllocateProductDialog({
  open,
  onOpenChange,
  products,
  events,
  onAllocate,
}: AllocateProductDialogProps) {
  const [eventId, setEventId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  const selectedProduct = products.find(p => p.id === productId);
  const availableEvents = events.filter(e => e.status !== 'completed' && e.status !== 'cancelled');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventId || !productId || !quantity) {
      toast.error("Preencha todos os campos");
      return;
    }

    const quantityNum = Number(quantity);
    if (selectedProduct && quantityNum > selectedProduct.currentStock) {
      toast.error("Quantidade superior ao stock disponível");
      return;
    }

    onAllocate({
      eventId,
      productId,
      allocatedQuantity: quantityNum,
    });

    setEventId("");
    setProductId("");
    setQuantity("");
    onOpenChange(false);
    toast.success("Produtos alocados ao evento!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alocar Produtos a Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event">Evento</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                {availableEvents.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.currentStock} {product.unit} disponíveis)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade a Alocar</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedProduct?.currentStock || undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
            {selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Stock disponível: {selectedProduct.currentStock} {selectedProduct.unit}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Alocar Produtos
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
