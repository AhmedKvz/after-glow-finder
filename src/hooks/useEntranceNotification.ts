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
    const sessionNotified = sessionStorage.getItem('entrance_notified_v3');
    console.log('🔔 Entrance notification hook initialized', { sessionNotified });
    
    if (sessionNotified === 'true') {
      console.log('⏭️ Notification already shown this session, skipping');
      return;
    }

    console.log('⏱️ Starting 3-second timer for entrance notification');
    
    // Start 3-second timer
    const timer = setTimeout(async () => {
      console.log('⏰ 3 seconds elapsed, fetching notification from Supabase...');
      try {
        // Fetch one random active notification directly from Supabase
        const { data, error } = await supabase
          .from('entrance_notifications')
          .select('id, message, emoji, priority')
          .eq('active', true)
          .order('random()')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        console.log('📬 Fetched random notification:', data);
        
        if (!data) {
          console.log('❌ No active notifications found');
          return;
        }

        setNotification(data as EntranceNotification);
        setIsOpen(true);

        // Mark session as notified
        sessionStorage.setItem('entrance_notified_v3', 'true');
        console.log('✅ Notification displayed from list and session marked');
      } catch (error) {
        console.error('❌ Error fetching entrance notification:', error);
      }
    }, 3000); // 3 seconds

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
