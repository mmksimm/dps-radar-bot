
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, User, Shield, CheckCircle, XCircle } from "lucide-react";
import { MapComponent } from "@/components/MapComponent";
import { AddLocationModal } from "@/components/AddLocationModal";
import { UserProfile } from "@/components/UserProfile";
import { PoliceMarkerCard } from "@/components/PoliceMarkerCard";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { useTelegram } from "@/hooks/useTelegram";
import { usePoliceLocations } from "@/hooks/usePoliceLocations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PoliceLocation {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  user_id: string;
  created_at: string;
  status: 'active' | 'confirmed' | 'disputed';
  profiles?: {
    username: string;
  };
  confirmations: number;
  denials: number;
}

const Index = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<PoliceLocation | null>(null);
  
  const { isAuthenticated, isLoading, telegramUser } = useTelegramAuth();
  const { showMainButton, hideMainButton, sendData } = useTelegram();
  const { data: policeLocations = [], refetch } = usePoliceLocations();
  const { toast } = useToast();

  const handleAddLocation = async (lat: number, lng: number, address: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Ошибка",
        description: "Необходима авторизация для добавления локации",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { error } = await supabase
        .from('police_locations')
        .insert({
          latitude: lat,
          longitude: lng,
          address: address,
          status: 'active',
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Успех!",
        description: "Пост ДПС добавлен на карту",
      });

      // Отправляем данные в Telegram
      sendData({
        action: 'location_added',
        location: { lat, lng, address }
      });

      refetch();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить локацию",
        variant: "destructive",
      });
    }
  };

  const handleVoteLocation = async (locationId: string, voteType: 'confirm' | 'deny') => {
    if (!isAuthenticated) {
      toast({
        title: "Ошибка",
        description: "Необходима авторизация для голосования",
        variant: "destructive",
      });
      return;
    }

    try {
      // Проверяем, не голосовал ли уже пользователь
      const { data: existingVote } = await supabase
        .from('location_votes')
        .select('id')
        .eq('location_id', locationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingVote) {
        toast({
          title: "Внимание",
          description: "Вы уже голосовали за эту локацию",
          variant: "destructive",
        });
        return;
      }

      // Добавляем голос
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { error } = await supabase
        .from('location_votes')
        .insert({
          location_id: locationId,
          vote_type: voteType,
          user_id: user.id
        });

      if (error) throw error;

      // Обновляем статус локации если нужно
      const location = policeLocations.find(l => l.id === locationId);
      if (location) {
        const newConfirmations = voteType === 'confirm' ? location.confirmations + 1 : location.confirmations;
        const newDenials = voteType === 'deny' ? location.denials + 1 : location.denials;
        
        let newStatus = location.status;
        if (newConfirmations >= 3) {
          newStatus = 'confirmed';
        } else if (newDenials >= 3) {
          newStatus = 'disputed';
        }

        await supabase
          .from('police_locations')
          .update({ status: newStatus })
          .eq('id', locationId);
      }

      toast({
        title: "Успех!",
        description: voteType === 'confirm' ? "Локация подтверждена" : "Локация опровергнута",
      });

      refetch();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось проголосовать",
        variant: "destructive",
      });
    }
  };

  // Telegram Mini App интеграция
  useEffect(() => {
    if (selectedMarker) {
      showMainButton('Закрыть детали', () => setSelectedMarker(null));
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

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="mb-4">
            <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
            <h1 className="text-xl font-bold">ДПС Радар</h1>
            <p className="text-muted-foreground">Необходима авторизация через Telegram</p>
          </div>
        </Card>
      </div>
    );
  }

  // Подсчитываем статистику из реальных данных
  const activeLocations = policeLocations.filter(l => l.status === 'active').length;
  const confirmedLocations = policeLocations.filter(l => l.status === 'confirmed').length;
  const disputedLocations = policeLocations.filter(l => l.status === 'disputed').length;

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
              <Badge variant="destructive">{activeLocations}</Badge>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-confirm" />
              <span className="text-muted-foreground">Подтверждено:</span>
              <Badge className="bg-confirm text-confirm-foreground">{confirmedLocations}</Badge>
            </div>
            <div className="flex items-center space-x-1">
              <XCircle className="h-3 w-3 text-warning" />
              <span className="text-muted-foreground">Спорных:</span>
              <Badge className="bg-warning text-warning-foreground">{disputedLocations}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Marker Details */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 right-4">
          <PoliceMarkerCard
            location={{
              ...selectedMarker,
              lat: selectedMarker.latitude,
              lng: selectedMarker.longitude,
              reportedBy: selectedMarker.profiles?.username || 'Анонимный пользователь',
              reportedAt: new Date(selectedMarker.created_at)
            }}
            onConfirm={() => handleVoteLocation(selectedMarker.id, 'confirm')}
            onDeny={() => handleVoteLocation(selectedMarker.id, 'deny')}
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
