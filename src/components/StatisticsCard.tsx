import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, Event, EventAllocation, MovementHistory } from '@/types/inventory';
import { TrendingUp, Package, Calendar, BarChart3 } from 'lucide-react';

interface StatisticsCardProps {
  products: Product[];
  events: Event[];
  allocations: EventAllocation[];
  movements: MovementHistory[];
}

export function StatisticsCard({ products, events, allocations, movements }: StatisticsCardProps) {
  const completedEvents = events.filter(e => e.status === 'completed').length;
  
  const avgProductsPerEvent = completedEvents > 0
    ? (allocations.length / completedEvents).toFixed(1)
    : '0';

  const productRotation = products.map(product => {
    const productMovements = movements.filter(m => m.productId === product.id);
    return {
      name: product.name,
      movements: productMovements.length,
    };
  }).sort((a, b) => b.movements - a.movements).slice(0, 5);

  const mostUsedProduct = productRotation[0];

  const scheduledEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return e.status === 'planned' && eventDate > new Date();
  }).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média Produtos/Evento</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgProductsPerEvent}</div>
          <p className="text-xs text-muted-foreground">Em eventos concluídos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Produto Mais Usado</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostUsedProduct?.name || 'N/A'}</div>
          <p className="text-xs text-muted-foreground">
            {mostUsedProduct?.movements || 0} movimentações
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos Agendados</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scheduledEvents}</div>
          <p className="text-xs text-muted-foreground">Próximos eventos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rotatividade Total</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{movements.length}</div>
          <p className="text-xs text-muted-foreground">Movimentações registadas</p>
        </CardContent>
      </Card>
    </div>
  );
}
