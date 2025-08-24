import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (lat: number, lng: number, address: string) => void;
}

export const AddLocationModal = ({ isOpen, onClose, onAdd }: AddLocationModalProps) => {
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsUsingCurrentLocation(true);
    // Mock current location detection
    setTimeout(() => {
      setAddress("Ваше текущее местоположение");
      setIsUsingCurrentLocation(false);
    }, 1000);
  };

  const handleSubmit = () => {
    if (!address.trim()) return;
    
    // Mock coordinates - would be replaced with actual geocoding
    const mockLat = 55.7558 + (Math.random() - 0.5) * 0.01;
    const mockLng = 37.6176 + (Math.random() - 0.5) * 0.01;
    
    onAdd(mockLat, mockLng, address);
    setAddress("");
    setDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <div className="p-2 bg-gradient-police rounded-full">
              <MapPin className="h-4 w-4 text-police-foreground" />
            </div>
            <span>Добавить пост ДПС</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                <div className="text-sm text-warning-foreground">
                  <p className="font-medium">Важно!</p>
                  <p>Сообщайте только достоверную информацию. Ложные данные вредят всем участникам.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-foreground">Адрес или местоположение</Label>
            <div className="space-y-2">
              <Input
                id="address"
                placeholder="Введите адрес или описание места"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={handleUseCurrentLocation}
                variant="outline"
                className="w-full"
                disabled={isUsingCurrentLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isUsingCurrentLocation ? "Определяем..." : "Использовать мое местоположение"}
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Дополнительная информация (необязательно)</Label>
            <Textarea
              id="description"
              placeholder="Например: стоят на обочине, проверяют документы..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!address.trim()}
              className="flex-1 bg-gradient-police text-police-foreground hover:opacity-90"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Ваше сообщение будет видно другим пользователям для подтверждения
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};