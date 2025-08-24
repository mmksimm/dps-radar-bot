import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegram } from './useTelegram';

export const useTelegramAuth = () => {
  const { user: telegramUser, isReady } = useTelegram();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  useEffect(() => {
    if (isReady && telegramUser) {
      authenticateWithTelegram();
    }
  }, [isReady, telegramUser]);

  const authenticateWithTelegram = async () => {
    if (!telegramUser) return;

    try {
      setIsLoading(true);
      
      // Создаем или получаем пользователя в Supabase
      // Используем Telegram ID как уникальный идентификатор
      const email = `${telegramUser.id}@telegram.user`;
      const password = `tg_${telegramUser.id}_${process.env.NODE_ENV}`;
      
      // Попытка входа
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Если пользователь не существует, создаем его
      if (error && error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: telegramUser.username || `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
              telegram_id: telegramUser.id,
              telegram_username: telegramUser.username,
              first_name: telegramUser.first_name,
              last_name: telegramUser.last_name,
              is_premium: telegramUser.is_premium,
              photo_url: telegramUser.photo_url,
            },
          },
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          setIsLoading(false);
          return;
        }

        data = signUpData;
      }

      if (data.user) {
        setSupabaseUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    telegramUser,
    supabaseUser,
  };
};