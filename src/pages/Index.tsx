import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Calendar, ArrowLeftRight, LayoutDashboard, Users, LogOut } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Product, Event, EventAllocation, MovementHistory, User } from "@/types/inventory";
import { ProductCard } from "@/components/ProductCard";
import { EventCard } from "@/components/EventCard";
import { AddProductDialog } from "@/components/AddProductDialog";
import { AddEventDialog } from "@/components/AddEventDialog";
import { AllocateProductDialog } from "@/components/AllocateProductDialog";
import { StatisticsCard } from "@/components/StatisticsCard";
import { UserManagement } from "@/components/UserManagement";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [users] = useLocalStorage<User[]>("users", []);
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [events, setEvents] = useLocalStorage<Event[]>("events", []);
  const [allocations, setAllocations] = useLocalStorage<EventAllocation[]>("allocations", []);
  const [movements, setMovements] = useLocalStorage<MovementHistory[]>("movements", []);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);

  const addProduct = (productData: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProducts([...products, newProduct]);
  };

  const addEvent = (eventData: Omit<Event, "id" | "createdAt" | "createdBy">) => {
    const newEvent: Event = {
      ...eventData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || '',
    };
    setEvents([...events, newEvent]);
  };

  const allocateProduct = (allocationData: {
    eventId: string;
    productId: string;
    allocatedQuantity: number;
  }) => {
    const product = products.find(p => p.id === allocationData.productId);
    if (!product || product.currentStock < allocationData.allocatedQuantity) {
      toast.error("Stock insuficiente");
      return;
    }

    const newAllocation: EventAllocation = {
      id: crypto.randomUUID(),
      ...allocationData,
      createdAt: new Date().toISOString(),
    };

    const newMovement: MovementHistory = {
      id: crypto.randomUUID(),
      productId: allocationData.productId,
      eventId: allocationData.eventId,
      type: "allocation",
      quantity: -allocationData.allocatedQuantity,
      date: new Date().toISOString(),
      userId: currentUser?.id || '',
    };

    setProducts(
      products.map(p =>
        p.id === allocationData.productId
          ? { ...p, currentStock: p.currentStock - allocationData.allocatedQuantity }
          : p
      )
    );
    setAllocations([...allocations, newAllocation]);
    setMovements([...movements, newMovement]);
  };

  const returnToStock = (allocationId: string, returnQuantity: number) => {
    const allocation = allocations.find(a => a.id === allocationId);
    if (!allocation) return;

    const newMovement: MovementHistory = {
      id: crypto.randomUUID(),
      productId: allocation.productId,
      eventId: allocation.eventId,
      type: "return",
      quantity: returnQuantity,
      date: new Date().toISOString(),
      userId: currentUser?.id || '',
    };

    setProducts(
      products.map(p =>
        p.id === allocation.productId
          ? { ...p, currentStock: p.currentStock + returnQuantity }
          : p
      )
    );
    
    setAllocations(
      allocations.map(a =>
        a.id === allocationId
          ? { ...a, returnedQuantity: (a.returnedQuantity || 0) + returnQuantity }
          : a
      )
    );
    
    setMovements([...movements, newMovement]);
    toast.success("Produtos devolvidos ao stock!");
  };

  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    p => p.minStock && p.currentStock <= p.minStock
  ).length;
  const activeEvents = events.filter(e => e.status === 'in-progress').length;
  const totalAllocations = allocations.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão de Stocks</h1>
              <p className="text-muted-foreground mt-1">Sistema de inventário para eventos</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
              </div>
              <Button variant="outline" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} max-w-3xl`}>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="allocations" className="gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Alocações
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Utilizadores
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <StatisticsCard 
              products={products}
              events={events}
              allocations={allocations}
              movements={movements}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Produtos</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalProducts}</p>
                  </div>
                  <Package className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Baixo</p>
                    <p className="text-3xl font-bold text-destructive mt-1">{lowStockProducts}</p>
                  </div>
                  <Package className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Eventos Ativos</p>
                    <p className="text-3xl font-bold text-accent mt-1">{activeEvents}</p>
                  </div>
                  <Calendar className="h-10 w-10 text-accent" />
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Alocações</p>
                    <p className="text-3xl font-bold text-primary mt-1">{totalAllocations}</p>
                  </div>
                  <ArrowLeftRight className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>

            {lowStockProducts > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <h3 className="font-semibold text-destructive mb-2">⚠️ Produtos com Stock Baixo</h3>
                <div className="space-y-1">
                  {products
                    .filter(p => p.minStock && p.currentStock <= p.minStock)
                    .map(p => (
                      <p key={p.id} className="text-sm text-foreground">
                        {p.name}: {p.currentStock} {p.unit} (mínimo: {p.minStock})
                      </p>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Inventário</h2>
              <AddProductDialog onAdd={addProduct} />
            </div>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum produto no inventário</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione o seu primeiro produto para começar
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Eventos</h2>
              <AddEventDialog onAdd={addEvent} />
            </div>
            {events.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum evento criado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie o seu primeiro evento para começar
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => {
                  const creator = users.find(u => u.id === event.createdBy);
                  return (
                    <EventCard key={event.id} event={event} creatorName={creator?.name} />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="allocations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Alocações de Produtos</h2>
              <Button onClick={() => setAllocateDialogOpen(true)} className="gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Alocar Produtos
              </Button>
            </div>
            {allocations.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma alocação registada</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Aloque produtos aos eventos conforme necessário
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allocations.map(allocation => {
                  const event = events.find(e => e.id === allocation.eventId);
                  const product = products.find(p => p.id === allocation.productId);
                  const canReturn = allocation.allocatedQuantity - (allocation.returnedQuantity || 0) > 0;

                  return (
                    <div key={allocation.id} className="bg-card p-4 rounded-lg border border-border">
                      <div className="flex justify-between items-start">
                         <div>
                           <h3 className="font-semibold text-foreground">{event?.name}</h3>
                           <p className="text-sm text-muted-foreground mt-1">
                             {product?.name}: {allocation.allocatedQuantity} {product?.unit} alocados
                           </p>
                           <p className="text-xs text-muted-foreground">
                             por {users.find(u => u.id === movements.find(m => m.eventId === event?.id && m.productId === product?.id && m.type === 'allocation')?.userId)?.name || 'Desconhecido'}
                           </p>
                          {allocation.returnedQuantity && (
                            <p className="text-sm text-accent mt-1">
                              ✓ {allocation.returnedQuantity} {product?.unit} devolvidos
                            </p>
                          )}
                        </div>
                        {canReturn && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const remaining = allocation.allocatedQuantity - (allocation.returnedQuantity || 0);
                              const returnQty = prompt(
                                `Quantos ${product?.unit} deseja devolver? (máximo: ${remaining})`
                              );
                              if (returnQty) {
                                const qty = Number(returnQty);
                                if (qty > 0 && qty <= remaining) {
                                  returnToStock(allocation.id, qty);
                                } else {
                                  toast.error("Quantidade inválida");
                                }
                              }
                            }}
                          >
                            Devolver ao Stock
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users" className="space-y-4">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <AllocateProductDialog
        open={allocateDialogOpen}
        onOpenChange={setAllocateDialogOpen}
        products={products}
        events={events}
        onAllocate={allocateProduct}
      />
    </div>
  );
};

export default Index;
