import { Event } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  creatorName?: string;
}

const statusConfig = {
  planned: { label: "Planeado", variant: "secondary" as const },
  "in-progress": { label: "Em Curso", variant: "default" as const },
  completed: { label: "Concluído", variant: "outline" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
};

export function EventCard({ event, onClick, creatorName }: EventCardProps) {
  const status = statusConfig[event.status];
  
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{event.name}</CardTitle>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {format(new Date(event.date), "d 'de' MMMM yyyy", { locale: ptBR })}
              {event.time && ` às ${event.time}`}
            </span>
          </div>
          {creatorName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm">Criado por {creatorName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
