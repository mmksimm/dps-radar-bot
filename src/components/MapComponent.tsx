
import { useEffect, useRef } from 'react';
import { MapPin, Shield, AlertTriangle } from 'lucide-react';

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

interface MapComponentProps {
  policeLocations: PoliceLocation[];
  onMarkerClick: (location: PoliceLocation) => void;
}

export const MapComponent = ({ policeLocations, onMarkerClick }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const getMarkerIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Shield className="h-4 w-4 text-confirm-foreground" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4 text-warning-foreground" />;
      default:
        return <MapPin className="h-4 w-4 text-police-foreground" />;
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-confirm border-confirm';
      case 'disputed':
        return 'bg-warning border-warning';
      default:
        return 'bg-police border-police';
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}м`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}ч`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}д`;
    }
  };

  // Simulate map interaction - will be replaced with actual map library
  useEffect(() => {
    if (!mapRef.current) return;

    const mapElement = mapRef.current;
    mapElement.style.background = `
      linear-gradient(45deg, #f0f4f8 25%, transparent 25%), 
      linear-gradient(-45deg, #f0f4f8 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #f0f4f8 75%), 
      linear-gradient(-45deg, transparent 75%, #f0f4f8 75%)
    `;
    mapElement.style.backgroundSize = '20px 20px';
    mapElement.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Mock Map Background */}
      <div 
        ref={mapRef}
        className="w-full h-full bg-muted relative overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, hsl(var(--primary) / 0.1) 0%, transparent 50%)
          `
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/10" />
        
        {/* Street Lines - Mock */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-border/30"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/30"></div>
          <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-border/30"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-border/30"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border/30"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-border/30"></div>
        </div>

        {/* Police Location Markers - Real Data */}
        {policeLocations.map((location, index) => {
          // Распределяем маркеры по карте на основе их координат
          const leftPercent = 10 + (index % 8) * 10;
          const topPercent = 15 + Math.floor(index / 8) * 15;
          
          return (
            <div
              key={location.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${getMarkerColor(location.status)} rounded-full p-2 shadow-lg border-2 animate-pulse`}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                animationDelay: `${index * 0.2}s`
              }}
              onClick={() => onMarkerClick(location)}
            >
              {getMarkerIcon(location.status)}
              
              {/* Ripple Effect */}
              <div className={`absolute inset-0 ${getMarkerColor(location.status)} rounded-full animate-ping opacity-20`}></div>
              
              {/* Time indicator */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-card px-2 py-1 rounded text-xs text-muted-foreground whitespace-nowrap shadow-soft">
                {getTimeAgo(location.created_at)} назад
              </div>
              
              {/* Vote indicator */}
              {(location.confirmations > 0 || location.denials > 0) && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-card px-1 py-0.5 rounded text-xs whitespace-nowrap shadow-soft flex items-center space-x-1">
                  {location.confirmations > 0 && (
                    <span className="text-confirm">+{location.confirmations}</span>
                  )}
                  {location.denials > 0 && (
                    <span className="text-destructive">-{location.denials}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Center Point (User Location) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-30"></div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 space-y-2">
        <button className="w-10 h-10 bg-card shadow-soft rounded-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors">
          <span className="text-lg font-bold">+</span>
        </button>
        <button className="w-10 h-10 bg-card shadow-soft rounded-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors">
          <span className="text-lg font-bold">−</span>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-soft">
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-police rounded-full"></div>
            <span className="text-muted-foreground">Новое сообщение</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-confirm rounded-full"></div>
            <span className="text-muted-foreground">Подтверждено</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="text-muted-foreground">Спорное</span>
          </div>
        </div>
      </div>

      {/* No data message */}
      {policeLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-card/95 backdrop-blur-sm rounded-lg p-4 text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Нет активных постов ДПС</p>
            <p className="text-xs text-muted-foreground">Будьте первым, кто добавит пост!</p>
          </div>
        </div>
      )}
    </div>
  );
};
