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
    console.log('🔔 Entrance notification hook initialized', { sessionNotified });
    
    if (sessionNotified === 'true') {
      console.log('⏭️ Notification already shown this session, skipping');
      return;
    }

    console.log('⏱️ Starting 60-second timer for entrance notification');
    
    // Start 60-second timer
    const timer = setTimeout(async () => {
      console.log('⏰ 60 seconds elapsed, fetching notification...');
      try {
        // Fetch all active notifications
        const { data, error } = await supabase
          .from('entrance_notifications')
          .select('id, message, emoji, priority')
          .eq('active', true);

        if (error) throw error;
        
        console.log('📬 Fetched notifications:', data);
        
        if (!data || data.length === 0) {
          console.log('❌ No active notifications found');
          return;
        }

        // Pick a random notification (with optional priority weighting)
        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedNotification = data[randomIndex];

        console.log('🎯 Selected notification:', selectedNotification);
        
        setNotification(selectedNotification);
        setIsOpen(true);

        // Mark session as notified
        sessionStorage.setItem('entrance_notified', 'true');
        console.log('✅ Notification displayed and session marked');
      } catch (error) {
        console.error('❌ Error fetching entrance notification:', error);
      }
    }, 60000); // 60 seconds

    return () => {
      console.log('🧹 Cleaning up entrance notification timer');
      clearTimeout(timer);
    };
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
