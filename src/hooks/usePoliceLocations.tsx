
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const usePoliceLocations = () => {
  return useQuery({
    queryKey: ['police-locations'],
    queryFn: async (): Promise<PoliceLocation[]> => {
      // Получаем локации
      const { data: locations, error } = await supabase
        .from('police_locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!locations) return [];

      // Получаем все профили пользователей
      const userIds = [...new Set(locations.map(l => l.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);

      // Создаем мапу профилей
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Для каждой локации подсчитываем голоса и добавляем профиль
      const locationsWithVotes = await Promise.all(
        locations.map(async (location) => {
          const { data: votes } = await supabase
            .from('location_votes')
            .select('vote_type')
            .eq('location_id', location.id);

          const confirmations = votes?.filter(v => v.vote_type === 'confirm').length || 0;
          const denials = votes?.filter(v => v.vote_type === 'deny').length || 0;
          const profile = profilesMap.get(location.user_id);

          return {
            ...location,
            confirmations,
            denials,
            profiles: profile ? { username: profile.username } : undefined
          } as PoliceLocation;
        })
      );

      return locationsWithVotes;
    },
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });
};
