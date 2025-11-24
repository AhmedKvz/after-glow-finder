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
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          logo_image_url: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_image_url?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_image_url?: string | null
          name?: string
          updated_at?: string
          user_id?: string
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
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
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
      events: {
        Row: {
          allow_plus_one: boolean | null
          allow_plus_two: boolean | null
          bring_own_drinks: boolean | null
          capacity: number
          created_at: string
          date: string
          description: string | null
          dj_name: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          exact_address: string | null
          host_id: string
          id: string
          is_location_hidden: boolean
          is_private: boolean | null
          join_request_required: boolean
          location: string
          music_tags: string[] | null
          owner_club_id: string | null
          requires_approval: boolean | null
          start_time: string
          ticketing_enabled: boolean
          title: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          allow_plus_one?: boolean | null
          allow_plus_two?: boolean | null
          bring_own_drinks?: boolean | null
          capacity: number
          created_at?: string
          date: string
          description?: string | null
          dj_name?: string | null
          end_time: string
          event_type?: Database["public"]["Enums"]["event_type"]
          exact_address?: string | null
          host_id: string
          id?: string
          is_location_hidden?: boolean
          is_private?: boolean | null
          join_request_required?: boolean
          location: string
          music_tags?: string[] | null
          owner_club_id?: string | null
          requires_approval?: boolean | null
          start_time: string
          ticketing_enabled?: boolean
          title: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          allow_plus_one?: boolean | null
          allow_plus_two?: boolean | null
          bring_own_drinks?: boolean | null
          capacity?: number
          created_at?: string
          date?: string
          description?: string | null
          dj_name?: string | null
          end_time?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          exact_address?: string | null
          host_id?: string
          id?: string
          is_location_hidden?: boolean
          is_private?: boolean | null
          join_request_required?: boolean
          location?: string
          music_tags?: string[] | null
          owner_club_id?: string | null
          requires_approval?: boolean | null
          start_time?: string
          ticketing_enabled?: boolean
          title?: string
          updated_at?: string
          venue_id?: string | null
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
          avatar_url: string | null
          bio: string | null
          birthdate: string | null
          city: string | null
          created_at: string
          display_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          lat: number | null
          lng: number | null
          music_tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          lat?: number | null
          lng?: number | null
          music_tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          lat?: number | null
          lng?: number | null
          music_tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          event_id: string
          id: string
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
      generate_ticket_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "club"
      application_status: "draft" | "pending" | "approved" | "rejected"
      event_type: "club" | "private_host" | "cafe"
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
      event_type: ["club", "private_host", "cafe"],
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
