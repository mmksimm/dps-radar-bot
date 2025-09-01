
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, CheckCircle, XCircle, Trophy, Calendar, Star } from "lucide-react";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile = ({ isOpen, onClose }: UserProfileProps) => {
  const { telegramUser, supabaseUser } = useTelegramAuth();
  
  // Загружаем реальные данные пользователя
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', supabaseUser?.id],
    queryFn: async () => {
      if (!supabaseUser?.id) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();
      
      return data;
    },
    enabled: !!supabaseUser?.id
  });

  // Загружаем статистику пользователя
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', supabaseUser?.id],
    queryFn: async () => {
      if (!supabaseUser?.id) return null;
      
      // Количество созданных локаций
      const { count: reportsCount } = await supabase
        .from('police_locations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', supabaseUser.id);

      // Количество голосов
      const { data: votes } = await supabase
        .from('location_votes')
        .select('vote_type')
        .eq('user_id', supabaseUser.id);

      const confirmationsGiven = votes?.filter(v => v.vote_type === 'confirm').length || 0;
      const denialsGiven = votes?.filter(v => v.vote_type === 'deny').length || 0;
      
      // Простой расчет точности
      const totalVotes = confirmationsGiven + denialsGiven;
      const accuracy = totalVotes > 0 ? Math.round((confirmationsGiven / totalVotes) * 100) : 100;
      
      return {
        reportsCount: reportsCount || 0,
        confirmationsGiven,
        denialsGiven,
        accuracy,
        totalPoints: (reportsCount || 0) * 10 + confirmationsGiven * 5
      };
    },
    enabled: !!supabaseUser?.id
  });

  const displayName = telegramUser 
    ? `${telegramUser.first_name}${telegramUser.last_name ? ` ${telegramUser.last_name}` : ''}`
    : userProfile?.username || "Пользователь";
    
  const getUserBadgeColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-confirm text-confirm-foreground";
    if (accuracy >= 70) return "bg-warning text-warning-foreground";
    return "bg-muted text-muted-foreground";
  };

  const getRank = (points: number) => {
    if (points >= 500) return "Эксперт дорог";
    if (points >= 200) return "Опытный водитель";
    if (points >= 50) return "Проверенный водитель";
    return "Новичок";
  };

  if (!userStats) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
                  <Badge className={getUserBadgeColor(userStats.accuracy)}>
                    {userStats.accuracy}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">{getRank(userStats.totalPoints)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">{userStats.totalPoints} очков</span>
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
                    <p className="text-2xl font-bold text-foreground">{userStats.reportsCount}</p>
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
                    <p className="text-2xl font-bold text-foreground">{userStats.confirmationsGiven}</p>
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
                    <p className="text-2xl font-bold text-foreground">{userStats.denialsGiven}</p>
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
                    <p className="text-2xl font-bold text-foreground">{userStats.accuracy}%</p>
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
                {userStats.reportsCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    🚗 Первое сообщение
                  </Badge>
                )}
                {userStats.accuracy >= 80 && (
                  <Badge variant="secondary" className="text-xs">
                    ✅ Точный помощник
                  </Badge>
                )}
                {userStats.reportsCount >= 10 && (
                  <Badge variant="secondary" className="text-xs">
                    📍 10 отметок
                  </Badge>
                )}
                {userStats.totalPoints >= 100 && (
                  <Badge variant="secondary" className="text-xs">
                    🏆 Проверенный
                  </Badge>
                )}
                {userStats.totalPoints === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    👋 Добро пожаловать!
                  </Badge>
                )}
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
          </div>

          {/* Info */}
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground text-center">
                💡 Используй DPS Radar через Telegram для удобства!
                <br />
                Твой ID: {telegramUser?.id || supabaseUser?.id || "Unknown"}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
