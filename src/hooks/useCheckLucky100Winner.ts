import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Lucky100WinnerData {
  ticketId: string;
  source: string;
  createdAt: string;
}

export const useCheckLucky100Winner = (userId: string | undefined) => {
  const [showModal, setShowModal] = useState(false);
  const [ticketData, setTicketData] = useState<Lucky100WinnerData | null>(null);

  useEffect(() => {
    if (!userId) return;

    const checkForLucky100Win = async () => {
      try {
        // First check if user has golden ticket
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_golden_ticket')
          .eq('user_id', userId)
          .single();

        if (!profile?.has_golden_ticket) return;

        // Check for Lucky100 or Lucky100Demo golden ticket
        const { data: ticket } = await supabase
          .from('golden_tickets')
          .select('id, source, created_at')
          .eq('user_id', userId)
          .in('source', ['Lucky100', 'Lucky100Demo'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!ticket) return;

        // Check if we've already shown the modal for this ticket
        const shownKey = `lucky100_modal_shown_${ticket.id}`;
        if (localStorage.getItem(shownKey)) return;

        // All conditions met - show modal
        setTicketData({
          ticketId: ticket.id,
          source: ticket.source,
          createdAt: ticket.created_at
        });
        setShowModal(true);
      } catch (error) {
        // Silently fail - user just won't see modal
        console.error('Error checking Lucky100 status:', error);
      }
    };

    checkForLucky100Win();
  }, [userId]);

  const dismissModal = () => {
    if (ticketData) {
      const shownKey = `lucky100_modal_shown_${ticketData.ticketId}`;
      localStorage.setItem(shownKey, 'true');
    }
    setShowModal(false);
  };

  return {
    showModal,
    ticketData,
    dismissModal
  };
};
