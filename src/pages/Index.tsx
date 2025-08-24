import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, User, Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { MapComponent } from "@/components/MapComponent";
import { AddLocationModal } from "@/components/AddLocationModal";
import { UserProfile } from "@/components/UserProfile";
import { PoliceMarkerCard } from "@/components/PoliceMarkerCard";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { useTelegram } from "@/hooks/useTelegram";

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

const Index = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<PoliceLocation | null>(null);
  
  const { isAuthenticated, isLoading, telegramUser } = useTelegramAuth();
  const { showMainButton, hideMainButton } = useTelegram();

  // Mock data - will be replaced with Supabase data
  const [policeLocations] = useState<PoliceLocation[]>([
    {
      id: '1',
      lat: 55.7558,
      lng: 37.6176,
      address: 'Красная площадь, Москва',
      reportedBy: 'Анонимный пользователь',
      reportedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      confirmations: 3,
      denials: 0,
      status: 'confirmed'
    },
    {
      id: '2', 
      lat: 55.7522,
      lng: 37.6156,
      address: 'ул. Тверская, 15',
      reportedBy: 'Водитель123',
      reportedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      confirmations: 1,
      denials: 2,
      status: 'disputed'
    }
  ]);

  const handleAddLocation = (lat: number, lng: number, address: string) => {
    console.log('Adding location:', { lat, lng, address });
    // Will integrate with Supabase
    setIsAddModalOpen(false);
  };

  const handleConfirmLocation = (id: string) => {
    console.log('Confirming location:', id);
    // Will integrate with Supabase
  };

  const handleDenyLocation = (id: string) => {
    console.log('Denying location:', id);
    // Will integrate with Supabase
  };

  // Telegram Mini App адаптация
  useEffect(() => {
    if (selectedMarker) {
      showMainButton('Закрыть', () => setSelectedMarker(null));
    } else {
      hideMainButton();
    }
  }, [selectedMarker, showMainButton, hideMainButton]);

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 shadow-soft">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-primary rounded-full">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">ДПС Радар</h1>
              <p className="text-xs text-muted-foreground">
                {telegramUser ? `Привет, ${telegramUser.first_name}!` : 'Совместная карта постов'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsProfileOpen(true)}
            className="rounded-full"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapComponent 
          policeLocations={policeLocations}
          onMarkerClick={setSelectedMarker}
        />
        
        {/* Floating Add Button */}
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="absolute bottom-20 right-4 h-14 w-14 rounded-full bg-gradient-police shadow-police hover:shadow-lg transition-all duration-300 hover:scale-105"
          size="icon"
        >
          <Plus className="h-6 w-6 text-police-foreground" />
        </Button>

        {/* Stats Bar */}
        <Card className="absolute top-4 left-4 right-4 p-3 bg-card/95 backdrop-blur-sm shadow-card">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-police rounded-full"></div>
              <span className="text-muted-foreground">Активных:</span>
              <Badge variant="destructive">{policeLocations.filter(l => l.status === 'active').length}</Badge>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-confirm" />
              <span className="text-muted-foreground">Подтверждено:</span>
              <Badge className="bg-confirm text-confirm-foreground">{policeLocations.filter(l => l.status === 'confirmed').length}</Badge>
            </div>
            <div className="flex items-center space-x-1">
              <XCircle className="h-3 w-3 text-warning" />
              <span className="text-muted-foreground">Спорных:</span>
              <Badge className="bg-warning text-warning-foreground">{policeLocations.filter(l => l.status === 'disputed').length}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Marker Details */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 right-4">
          <PoliceMarkerCard
            location={selectedMarker}
            onConfirm={() => handleConfirmLocation(selectedMarker.id)}
            onDeny={() => handleDenyLocation(selectedMarker.id)}
            onClose={() => setSelectedMarker(null)}
          />
        </div>
      )}

      {/* Modals */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddLocation}
      />

      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default Index;