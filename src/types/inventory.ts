export interface Product {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  minStock?: number;
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface EventAllocation {
  id: string;
  eventId: string;
  productId: string;
  allocatedQuantity: number;
  usedQuantity?: number;
  returnedQuantity?: number;
  createdAt: string;
}

export interface MovementHistory {
  id: string;
  productId: string;
  eventId?: string;
  type: 'allocation' | 'return' | 'adjustment';
  quantity: number;
  date: string;
  notes?: string;
}
