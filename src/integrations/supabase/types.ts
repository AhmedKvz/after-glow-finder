export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      after_access_requests: {
        Row: {
          created_at: string
          decision_at: string | null
          decision_by_user_id: string | null
          event_id: string
          id: string
          is_within_preference: boolean | null
          reason_flag: string | null
          requester_user_id: string
          shared_events_count: number | null
          status: string
          trust_preview: string | null
        }
        Insert: {
          created_at?: string
          decision_at?: string | null
          decision_by_user_id?: string | null
          event_id: string
          id?: string
          is_within_preference?: boolean | null
          reason_flag?: string | null
          requester_user_id: string
          shared_events_count?: number | null
          status?: string
          trust_preview?: string | null
        }
        Update: {
          created_at?: string
          decision_at?: string | null
          decision_by_user_id?: string | null
          event_id?: string
          id?: string
          is_within_preference?: boolean | null
          reason_flag?: string | null
          requester_user_id?: string
          shared_events_count?: number | null
          status?: string
          trust_preview?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "after_access_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          active: boolean | null
          content_url: string
          created_at: string | null
          event_id: string | null
          id: string
          preview_text: string | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          content_url: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          preview_text?: string | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          active?: boolean | null
          content_url?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          preview_text?: string | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          checked_in_at: string
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_swipe_entries: {
        Row: {
          created_at: string
          id: string
          paid: boolean | null
          payment_intent_id: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          paid?: boolean | null
          payment_intent_id?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          paid?: boolean | null
          payment_intent_id?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_swipe_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "circle_swipe_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_swipe_matches: {
        Row: {
          chat_id: string | null
          created_at: string
          id: string
          session_id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          chat_id?: string | null
          created_at?: string
          id?: string
          session_id: string
          user1_id: string
          user2_id: string
        }
        Update: {
          chat_id?: string | null
          created_at?: string
          id?: string
          session_id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_swipe_matches_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "circle_swipe_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_swipe_sessions: {
        Row: {
          created_at: string
          ends_at: string
          entry_price_eur: number
          event_id: string
          id: string
          participant_ids: string[]
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          entry_price_eur?: number
          event_id: string
          id?: string
          participant_ids?: string[]
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          entry_price_eur?: number
          event_id?: string
          id?: string
          participant_ids?: string[]
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_swipe_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_swipe_votes: {
        Row: {
          created_at: string
          id: string
          session_id: string
          swiper_id: string
          target_id: string
          vote: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          swiper_id: string
          target_id: string
          vote: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          swiper_id?: string
          target_id?: string
          vote?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "circle_swipe_votes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "circle_swipe_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      club_profiles: {
        Row: {
          address: string
          club_badges: Json | null
          club_heat_rank: number | null
          club_reputation: number | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          heat_average: number | null
          id: string
          logo_image_url: string | null
          name: string
          recent_event_heat_scores: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          club_badges?: Json | null
          club_heat_rank?: number | null
          club_reputation?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          heat_average?: number | null
          id?: string
          logo_image_url?: string | null
          name: string
          recent_event_heat_scores?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          club_badges?: Json | null
          club_heat_rank?: number | null
          club_reputation?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          heat_average?: number | null
          id?: string
          logo_image_url?: string | null
          name?: string
          recent_event_heat_scores?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      entrance_notifications: {
        Row: {
          active: boolean
          created_at: string | null
          emoji: string | null
          id: string
          message: string
          priority: number | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          emoji?: string | null
          id?: string
          message: string
          priority?: number | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          emoji?: string | null
          id?: string
          message?: string
          priority?: number | null
        }
        Relationships: []
      }
      event_access: {
        Row: {
          created_at: string
          event_id: string
          id: string
          message: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          message?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_access_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_chat_members: {
        Row: {
          chat_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "event_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      event_chat_messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "event_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      event_chats: {
        Row: {
          created_at: string
          event_id: string
          id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_chats_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_circle_access: {
        Row: {
          access_type: string
          created_at: string
          event_id: string
          id: string
          paid_amount_rsd: number
          user_id: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          access_type?: string
          created_at?: string
          event_id: string
          id?: string
          paid_amount_rsd?: number
          user_id: string
          valid_from?: string
          valid_until: string
        }
        Update: {
          access_type?: string
          created_at?: string
          event_id?: string
          id?: string
          paid_amount_rsd?: number
          user_id?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_circle_access_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_orders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          plus_guests: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          plus_guests?: number | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          plus_guests?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reviews: {
        Row: {
          comment: string | null
          created_at: string
          event_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_swipes: {
        Row: {
          created_at: string
          event_id: string
          id: string
          swipe_direction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          swipe_direction: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          swipe_direction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_swipes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          after_instructions: string | null
          allow_plus_one: boolean | null
          allow_plus_two: boolean | null
          attendee_user_ids: Json | null
          blog_link: string | null
          bring_own_drinks: boolean | null
          capacity: number
          created_at: string
          date: string
          description: string | null
          dj_name: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          exact_address: string | null
          full_address: string | null
          golden_only: boolean | null
          heat_badge: string | null
          heat_score: number | null
          host_id: string
          id: string
          is_location_hidden: boolean
          is_private: boolean | null
          is_private_after: boolean | null
          is_secret: boolean | null
          join_request_required: boolean
          location: string
          min_trust_score: number | null
          music_tags: string[] | null
          owner_club_id: string | null
          poster_url: string | null
          preferred_levels: string[] | null
          private_request_count: number | null
          public_location_label: string | null
          requires_approval: boolean | null
          secret_access_level: number | null
          secret_cover_blurred: string | null
          secret_preview_text: string | null
          shares_count: number | null
          start_time: string
          swipe_count: number | null
          ticket_link: string | null
          ticket_sales_count: number | null
          ticketing_enabled: boolean
          title: string
          trust_interest_avg: number | null
          updated_at: string
          venue_id: string | null
          vibe_tags: string[] | null
          watchlist_count: number | null
          wishlist_user_ids: Json | null
          xp_interest_sum: number | null
          xp_reward: number | null
        }
        Insert: {
          after_instructions?: string | null
          allow_plus_one?: boolean | null
          allow_plus_two?: boolean | null
          attendee_user_ids?: Json | null
          blog_link?: string | null
          bring_own_drinks?: boolean | null
          capacity: number
          created_at?: string
          date: string
          description?: string | null
          dj_name?: string | null
          end_time: string
          event_type?: Database["public"]["Enums"]["event_type"]
          exact_address?: string | null
          full_address?: string | null
          golden_only?: boolean | null
          heat_badge?: string | null
          heat_score?: number | null
          host_id: string
          id?: string
          is_location_hidden?: boolean
          is_private?: boolean | null
          is_private_after?: boolean | null
          is_secret?: boolean | null
          join_request_required?: boolean
          location: string
          min_trust_score?: number | null
          music_tags?: string[] | null
          owner_club_id?: string | null
          poster_url?: string | null
          preferred_levels?: string[] | null
          private_request_count?: number | null
          public_location_label?: string | null
          requires_approval?: boolean | null
          secret_access_level?: number | null
          secret_cover_blurred?: string | null
          secret_preview_text?: string | null
          shares_count?: number | null
          start_time: string
          swipe_count?: number | null
          ticket_link?: string | null
          ticket_sales_count?: number | null
          ticketing_enabled?: boolean
          title: string
          trust_interest_avg?: number | null
          updated_at?: string
          venue_id?: string | null
          vibe_tags?: string[] | null
          watchlist_count?: number | null
          wishlist_user_ids?: Json | null
          xp_interest_sum?: number | null
          xp_reward?: number | null
        }
        Update: {
          after_instructions?: string | null
          allow_plus_one?: boolean | null
          allow_plus_two?: boolean | null
          attendee_user_ids?: Json | null
          blog_link?: string | null
          bring_own_drinks?: boolean | null
          capacity?: number
          created_at?: string
          date?: string
          description?: string | null
          dj_name?: string | null
          end_time?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          exact_address?: string | null
          full_address?: string | null
          golden_only?: boolean | null
          heat_badge?: string | null
          heat_score?: number | null
          host_id?: string
          id?: string
          is_location_hidden?: boolean
          is_private?: boolean | null
          is_private_after?: boolean | null
          is_secret?: boolean | null
          join_request_required?: boolean
          location?: string
          min_trust_score?: number | null
          music_tags?: string[] | null
          owner_club_id?: string | null
          poster_url?: string | null
          preferred_levels?: string[] | null
          private_request_count?: number | null
          public_location_label?: string | null
          requires_approval?: boolean | null
          secret_access_level?: number | null
          secret_cover_blurred?: string | null
          secret_preview_text?: string | null
          shares_count?: number | null
          start_time?: string
          swipe_count?: number | null
          ticket_link?: string | null
          ticket_sales_count?: number | null
          ticketing_enabled?: boolean
          title?: string
          trust_interest_avg?: number | null
          updated_at?: string
          venue_id?: string | null
          vibe_tags?: string[] | null
          watchlist_count?: number | null
          wishlist_user_ids?: Json | null
          xp_interest_sum?: number | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_owner_club_id_fkey"
            columns: ["owner_club_id"]
            isOneToOne: false
            referencedRelation: "club_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      global_counters: {
        Row: {
          key: string
          updated_at: string
          value: number
        }
        Insert: {
          key: string
          updated_at?: string
          value?: number
        }
        Update: {
          key?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      golden_tickets: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string
          notes: string | null
          source: string
          status: string
          updated_at: string
          used_at: string | null
          used_event_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          notes?: string | null
          source?: string
          status?: string
          updated_at?: string
          used_at?: string | null
          used_event_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          notes?: string | null
          source?: string
          status?: string
          updated_at?: string
          used_at?: string | null
          used_event_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_golden_tickets_used_event"
            columns: ["used_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_bookings: {
        Row: {
          base_price: number
          booking_type: string
          client_id: string
          client_notes: string | null
          created_at: string
          destination: string | null
          duration_hours: number | null
          end_time: string | null
          group_size: number | null
          guide_id: string
          guide_notes: string | null
          id: string
          meeting_point: string
          payment_intent_id: string | null
          payment_status: string | null
          rating: number | null
          review_text: string | null
          start_time: string
          status: string
          tip_amount: number | null
          total_price: number
          updated_at: string
        }
        Insert: {
          base_price: number
          booking_type: string
          client_id: string
          client_notes?: string | null
          created_at?: string
          destination?: string | null
          duration_hours?: number | null
          end_time?: string | null
          group_size?: number | null
          guide_id: string
          guide_notes?: string | null
          id?: string
          meeting_point: string
          payment_intent_id?: string | null
          payment_status?: string | null
          rating?: number | null
          review_text?: string | null
          start_time: string
          status?: string
          tip_amount?: number | null
          total_price: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          booking_type?: string
          client_id?: string
          client_notes?: string | null
          created_at?: string
          destination?: string | null
          duration_hours?: number | null
          end_time?: string | null
          group_size?: number | null
          guide_id?: string
          guide_notes?: string | null
          id?: string
          meeting_point?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          rating?: number | null
          review_text?: string | null
          start_time?: string
          status?: string
          tip_amount?: number | null
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_bookings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          available_today: boolean | null
          available_tomorrow: boolean | null
          available_weekend: boolean | null
          average_rating: number | null
          badges: string[] | null
          can_host_afters: boolean | null
          created_at: string
          helper_id: string | null
          id: string
          languages: string[] | null
          max_group_size: number | null
          nightlife_style: string[] | null
          preferred_zones: string[] | null
          price_per_experience: number | null
          price_per_hour: number | null
          price_per_night: number | null
          specialties: string | null
          total_guests_guided: number | null
          total_tours: number | null
          updated_at: string
          user_id: string
          years_as_guide: number | null
        }
        Insert: {
          available_today?: boolean | null
          available_tomorrow?: boolean | null
          available_weekend?: boolean | null
          average_rating?: number | null
          badges?: string[] | null
          can_host_afters?: boolean | null
          created_at?: string
          helper_id?: string | null
          id?: string
          languages?: string[] | null
          max_group_size?: number | null
          nightlife_style?: string[] | null
          preferred_zones?: string[] | null
          price_per_experience?: number | null
          price_per_hour?: number | null
          price_per_night?: number | null
          specialties?: string | null
          total_guests_guided?: number | null
          total_tours?: number | null
          updated_at?: string
          user_id: string
          years_as_guide?: number | null
        }
        Update: {
          available_today?: boolean | null
          available_tomorrow?: boolean | null
          available_weekend?: boolean | null
          average_rating?: number | null
          badges?: string[] | null
          can_host_afters?: boolean | null
          created_at?: string
          helper_id?: string | null
          id?: string
          languages?: string[] | null
          max_group_size?: number | null
          nightlife_style?: string[] | null
          preferred_zones?: string[] | null
          price_per_experience?: number | null
          price_per_hour?: number | null
          price_per_night?: number | null
          specialties?: string | null
          total_guests_guided?: number | null
          total_tours?: number | null
          updated_at?: string
          user_id?: string
          years_as_guide?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guides_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_applications: {
        Row: {
          admin_notes: string | null
          availability_24_7: boolean | null
          availability_schedule: Json | null
          bio: string | null
          category_tags: string[] | null
          city: string
          coverage_area: string | null
          created_at: string
          display_name: string
          email: string | null
          gallery_urls: string[] | null
          hourly_rate: number | null
          id: string
          instagram: string | null
          phone: string | null
          price_range: string | null
          profile_image_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_data: Json | null
          role_type: Database["public"]["Enums"]["marketplace_role"]
          session_rate: number | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          availability_24_7?: boolean | null
          availability_schedule?: Json | null
          bio?: string | null
          category_tags?: string[] | null
          city: string
          coverage_area?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          gallery_urls?: string[] | null
          hourly_rate?: number | null
          id?: string
          instagram?: string | null
          phone?: string | null
          price_range?: string | null
          profile_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_data?: Json | null
          role_type: Database["public"]["Enums"]["marketplace_role"]
          session_rate?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          availability_24_7?: boolean | null
          availability_schedule?: Json | null
          bio?: string | null
          category_tags?: string[] | null
          city?: string
          coverage_area?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          gallery_urls?: string[] | null
          hourly_rate?: number | null
          id?: string
          instagram?: string | null
          phone?: string | null
          price_range?: string | null
          profile_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_data?: Json | null
          role_type?: Database["public"]["Enums"]["marketplace_role"]
          session_rate?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          afters_hosted: number | null
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          birthdate: string | null
          circle_swipe_velocity: number | null
          city: string | null
          created_at: string
          display_name: string | null
          events_attended: number | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          golden_ticket_count: number | null
          has_golden_ticket: boolean | null
          id: string
          last_circle_activity: string | null
          lat: number | null
          level: string | null
          lng: number | null
          lucky100_wins: number | null
          music_tags: string[] | null
          spicy_likelihood_score: number | null
          spicy_state: boolean | null
          spicy_state_expires_at: string | null
          trust_score: number | null
          updated_at: string
          user_id: string
          vip_status: boolean | null
          xp: number | null
        }
        Insert: {
          afters_hosted?: number | null
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          birthdate?: string | null
          circle_swipe_velocity?: number | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          events_attended?: number | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          golden_ticket_count?: number | null
          has_golden_ticket?: boolean | null
          id?: string
          last_circle_activity?: string | null
          lat?: number | null
          level?: string | null
          lng?: number | null
          lucky100_wins?: number | null
          music_tags?: string[] | null
          spicy_likelihood_score?: number | null
          spicy_state?: boolean | null
          spicy_state_expires_at?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
          vip_status?: boolean | null
          xp?: number | null
        }
        Update: {
          afters_hosted?: number | null
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          birthdate?: string | null
          circle_swipe_velocity?: number | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          events_attended?: number | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          golden_ticket_count?: number | null
          has_golden_ticket?: boolean | null
          id?: string
          last_circle_activity?: string | null
          lat?: number | null
          level?: string | null
          lng?: number | null
          lucky100_wins?: number | null
          music_tags?: string[] | null
          spicy_likelihood_score?: number | null
          spicy_state?: boolean | null
          spicy_state_expires_at?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          vip_status?: boolean | null
          xp?: number | null
        }
        Relationships: []
      }
      quests: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          quest_type: string
          status: string
          title: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          quest_type: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          quest_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      spicy_mode_purchases: {
        Row: {
          amount_paid: number
          circle_session_id: string
          created_at: string
          expires_at: string
          id: string
          payment_intent_id: string | null
          purchased_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          circle_session_id: string
          created_at?: string
          expires_at?: string
          id?: string
          payment_intent_id?: string | null
          purchased_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          circle_session_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          payment_intent_id?: string | null
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spicy_mode_purchases_circle_session_id_fkey"
            columns: ["circle_session_id"]
            isOneToOne: false
            referencedRelation: "circle_swipe_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      spicy_prompts: {
        Row: {
          circle_session_id: string
          created_at: string
          id: string
          responded_at: string | null
          response: string | null
          spicy_likelihood_score: number
          triggered_by_user_id: string
          user_id: string
        }
        Insert: {
          circle_session_id: string
          created_at?: string
          id?: string
          responded_at?: string | null
          response?: string | null
          spicy_likelihood_score: number
          triggered_by_user_id: string
          user_id: string
        }
        Update: {
          circle_session_id?: string
          created_at?: string
          id?: string
          responded_at?: string | null
          response?: string | null
          spicy_likelihood_score?: number
          triggered_by_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spicy_prompts_circle_session_id_fkey"
            columns: ["circle_session_id"]
            isOneToOne: false
            referencedRelation: "circle_swipe_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_lucky100_winner: boolean | null
          payment_intent_id: string | null
          price_paid: number
          purchase_date: string
          qr_code_data: string | null
          status: string
          ticket_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_lucky100_winner?: boolean | null
          payment_intent_id?: string | null
          price_paid?: number
          purchase_date?: string
          qr_code_data?: string | null
          status?: string
          ticket_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_lucky100_winner?: boolean | null
          payment_intent_id?: string | null
          price_paid?: number
          purchase_date?: string
          qr_code_data?: string | null
          status?: string
          ticket_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reviews: {
        Row: {
          comment: string | null
          created_at: string
          event_id: string | null
          id: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          rating?: number
          reviewed_user_id?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      circle_access_status: { Args: { _event_id: string }; Returns: Json }
      generate_ticket_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_registered_users_counter: { Args: never; Returns: number }
      is_demo_mode: { Args: never; Returns: boolean }
      issue_golden_ticket: {
        Args: {
          _expires_at?: string
          _notes?: string
          _source?: string
          _user_id: string
        }
        Returns: string
      }
      redeem_lucky100_event_credit: {
        Args: { _event_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user" | "club"
      application_status: "draft" | "pending" | "approved" | "rejected"
      event_type: "club" | "private_host" | "cafe" | "secret" | "after"
      gender_type: "male" | "female" | "other" | "hidden"
      marketplace_role:
        | "general_helper"
        | "wellness_support"
        | "dj_musician"
        | "event_staff"
        | "vendor_store"
        | "props_rental"
        | "be_my_guide"
      vote_type: "like" | "pass"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "club"],
      application_status: ["draft", "pending", "approved", "rejected"],
      event_type: ["club", "private_host", "cafe", "secret", "after"],
      gender_type: ["male", "female", "other", "hidden"],
      marketplace_role: [
        "general_helper",
        "wellness_support",
        "dj_musician",
        "event_staff",
        "vendor_store",
        "props_rental",
        "be_my_guide",
      ],
      vote_type: ["like", "pass"],
    },
  },
} as const
