import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, MapPin, Clock, User, X } from "lucide-react";

interface PoliceLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
  reportedBy: string;
  reportedAt: Date;
  confirmations: number;
  denials: number;
  status: 'active' | 'confirmed' | 'disputed';
}

interface PoliceMarkerCardProps {
  location: PoliceLocation;
  onConfirm: () => void;
  onDeny: () => void;
  onClose: () => void;
}

export const PoliceMarkerCard = ({ location, onConfirm, onDeny, onClose }: PoliceMarkerCardProps) => {
  const getStatusBadge = () => {
    switch (location.status) {
      case 'confirmed':
        return <Badge className="bg-confirm text-confirm-foreground">Подтверждено</Badge>;
      case 'disputed':
        return <Badge className="bg-warning text-warning-foreground">Спорное</Badge>;
      default:
        return <Badge variant="destructive">Новое</Badge>;
    }
  };

  const timeAgo = Math.floor((Date.now() - location.reportedAt.getTime()) / (1000 * 60));

  return (
    <Card className="bg-card/95 backdrop-blur-sm shadow-card border border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-police/10 rounded-full">
              <MapPin className="h-4 w-4 text-police" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Пост ДПС</h3>
              {getStatusBadge()}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{location.address}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Сообщил: {location.reportedBy}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo} минут назад</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-confirm" />
              <span className="text-confirm font-medium">{location.confirmations}</span>
            </div>
            <div className="flex items-center space-x-1">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive font-medium">{location.denials}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={onConfirm}
            className="flex-1 bg-confirm hover:bg-confirm/90 text-confirm-foreground"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Подтвердить
          </Button>
          <Button
            onClick={onDeny}
            variant="destructive"
            className="flex-1"
            size="sm"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Опровергнуть
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Ваша отметка поможет другим водителям
        </p>
      </CardContent>
    </Card>
  );
};