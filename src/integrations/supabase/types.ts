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
          exact_address: string | null
          host_id: string
          id: string
          location: string
          music_tags: string[] | null
          start_time: string
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
          exact_address?: string | null
          host_id: string
          id?: string
          location: string
          music_tags?: string[] | null
          start_time: string
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
          exact_address?: string | null
          host_id?: string
          id?: string
          location?: string
          music_tags?: string[] | null
          start_time?: string
          title?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      gender_type: "male" | "female" | "other" | "hidden"
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
      gender_type: ["male", "female", "other", "hidden"],
      vote_type: ["like", "pass"],
    },
  },
} as const
