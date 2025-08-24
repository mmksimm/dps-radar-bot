import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, CheckCircle, XCircle, Trophy, Calendar, Star } from "lucide-react";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile = ({ isOpen, onClose }: UserProfileProps) => {
  const { telegramUser } = useTelegramAuth();
  
  // Mock stats data - will be replaced with Supabase data  
  const userData = {
    reportsCount: 15,
    confirmationsGiven: 42,
    denialsGiven: 8,
    accuracy: 88,
    rank: "Проверенный водитель",
    totalPoints: 350
  };

  const displayName = telegramUser 
    ? `${telegramUser.first_name}${telegramUser.last_name ? ` ${telegramUser.last_name}` : ''}`
    : "Пользователь";
    
  const username = telegramUser?.username || displayName;

  const getUserBadgeColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-confirm text-confirm-foreground";
    if (accuracy >= 70) return "bg-warning text-warning-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <div className="p-2 bg-gradient-primary rounded-full">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>Профиль пользователя</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{displayName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {telegramUser?.username && `@${telegramUser.username}`}
                  {telegramUser?.is_premium && " ⭐ Premium"}
                </p>
              </div>
                <div className="text-center">
                  {telegramUser?.photo_url ? (
                    <img 
                      src={telegramUser.photo_url} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover mb-1"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-1">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                  )}
                  <Badge className={getUserBadgeColor(userData.accuracy)}>
                    {userData.accuracy}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">{userData.rank}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">{userData.totalPoints} очков</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-police/10 rounded-full">
                    <MapPin className="h-4 w-4 text-police" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{userData.reportsCount}</p>
                    <p className="text-xs text-muted-foreground">Сообщений</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-confirm/10 rounded-full">
                    <CheckCircle className="h-4 w-4 text-confirm" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{userData.confirmationsGiven}</p>
                    <p className="text-xs text-muted-foreground">Подтверждений</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-destructive/10 rounded-full">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{userData.denialsGiven}</p>
                    <p className="text-xs text-muted-foreground">Опровержений</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{userData.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Точность</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-warning" />
                <span>Достижения</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  🚗 Первое сообщение
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ✅ Точный помощник
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  📍 10 отметок
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  🏆 Проверенный
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              <Calendar className="h-4 w-4 mr-2" />
              История активности
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              Настройки уведомлений
            </Button>
          </div>

          {/* Info */}
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground text-center">
                💡 Используй DPS Radar через Telegram для удобства!
                <br />
                Твой ID: {telegramUser?.id || "Unknown"}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};