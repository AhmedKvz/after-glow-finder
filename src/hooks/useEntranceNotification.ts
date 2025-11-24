import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EntranceNotification {
  id: string;
  message: string;
  emoji: string;
  priority: number;
}

export const useEntranceNotification = () => {
  const [notification, setNotification] = useState<EntranceNotification | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if notification was already shown in this session
    const sessionNotified = sessionStorage.getItem('entrance_notified');
    if (sessionNotified === 'true') {
      return;
    }

    // Start 60-second timer
    const timer = setTimeout(async () => {
      try {
        // Fetch all active notifications
        const { data, error } = await supabase
          .from('entrance_notifications')
          .select('id, message, emoji, priority')
          .eq('active', true);

        if (error) throw error;
        if (!data || data.length === 0) return;

        // Pick a random notification (with optional priority weighting)
        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedNotification = data[randomIndex];

        setNotification(selectedNotification);
        setIsOpen(true);

        // Mark session as notified
        sessionStorage.setItem('entrance_notified', 'true');
      } catch (error) {
        console.error('Error fetching entrance notification:', error);
      }
    }, 60000); // 60 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return {
    notification,
    isOpen,
    handleClose,
  };
};
