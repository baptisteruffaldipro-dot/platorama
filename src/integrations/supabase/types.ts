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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string
          email: string | null
          error: string | null
          id: string
          member_id: string | null
          phone: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          email?: string | null
          error?: string | null
          id?: string
          member_id?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          email?: string | null
          error?: string | null
          id?: string
          member_id?: string | null
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "loyalty_members"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          body: string
          channel: string
          created_at: string
          cta_label: string
          cta_url: string
          error: string | null
          failed_count: number
          id: string
          image_url: string
          name: string
          restaurant_id: string
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
          target_lang: string | null
          updated_at: string
        }
        Insert: {
          body?: string
          channel?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          error?: string | null
          failed_count?: number
          id?: string
          image_url?: string
          name?: string
          restaurant_id: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
          target_lang?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          error?: string | null
          failed_count?: number
          id?: string
          image_url?: string
          name?: string
          restaurant_id?: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
          target_lang?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_events: {
        Row: {
          channel: string
          created_at: string
          email: string | null
          granted: boolean
          id: string
          member_id: string | null
          phone: string | null
          restaurant_id: string
          source: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          email?: string | null
          granted: boolean
          id?: string
          member_id?: string | null
          phone?: string | null
          restaurant_id: string
          source?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          email?: string | null
          granted?: boolean
          id?: string
          member_id?: string | null
          phone?: string | null
          restaurant_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "loyalty_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_menus: {
        Row: {
          caption: string
          created_at: string
          formula_label: string
          formula_price: number | null
          id: string
          image_square: string
          image_story: string
          is_published: boolean
          items: Json
          menu_date: string
          restaurant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          caption?: string
          created_at?: string
          formula_label?: string
          formula_price?: number | null
          id?: string
          image_square?: string
          image_story?: string
          is_published?: boolean
          items?: Json
          menu_date?: string
          restaurant_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          caption?: string
          created_at?: string
          formula_label?: string
          formula_price?: number | null
          id?: string
          image_square?: string
          image_story?: string
          is_published?: boolean
          items?: Json
          menu_date?: string
          restaurant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_menus_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_events: {
        Row: {
          created_at: string
          dish_id: string
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string
          dish_id: string
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string
          dish_id?: string
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_events_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          allergens: string[]
          badge: string | null
          category: string
          chef_note: string
          created_at: string
          id: string
          ingredients: string
          is_available: boolean
          model_android: string
          model_ios: string
          name: string
          prep_time: number | null
          price: number
          restaurant_id: string | null
          sort_order: number
          story_image: string
          story_text: string
          thumbnail: string
          time_slot: string
          updated_at: string
        }
        Insert: {
          allergens?: string[]
          badge?: string | null
          category: string
          chef_note?: string
          created_at?: string
          id?: string
          ingredients?: string
          is_available?: boolean
          model_android?: string
          model_ios?: string
          name: string
          prep_time?: number | null
          price?: number
          restaurant_id?: string | null
          sort_order?: number
          story_image?: string
          story_text?: string
          thumbnail?: string
          time_slot?: string
          updated_at?: string
        }
        Update: {
          allergens?: string[]
          badge?: string | null
          category?: string
          chef_note?: string
          created_at?: string
          id?: string
          ingredients?: string
          is_available?: boolean
          model_android?: string
          model_ios?: string
          name?: string
          prep_time?: number | null
          price?: number
          restaurant_id?: string | null
          sort_order?: number
          story_image?: string
          story_text?: string
          thumbnail?: string
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_members: {
        Row: {
          access_token: string
          card_code: string
          consent_at: string | null
          consent_email: boolean
          consent_sms: boolean
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          lang: string | null
          phone: string | null
          points: number
          restaurant_id: string
          unsubscribed_at: string | null
          updated_at: string
          visits: number
        }
        Insert: {
          access_token?: string
          card_code: string
          consent_at?: string | null
          consent_email?: boolean
          consent_sms?: boolean
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          lang?: string | null
          phone?: string | null
          points?: number
          restaurant_id: string
          unsubscribed_at?: string | null
          updated_at?: string
          visits?: number
        }
        Update: {
          access_token?: string
          card_code?: string
          consent_at?: string | null
          consent_email?: boolean
          consent_sms?: boolean
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          lang?: string | null
          phone?: string | null
          points?: number
          restaurant_id?: string
          unsubscribed_at?: string | null
          updated_at?: string
          visits?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          label: string
          points_cost: number
          restaurant_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label: string
          points_cost?: number
          restaurant_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          points_cost?: number
          restaurant_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          label: string | null
          member_id: string
          points: number
          restaurant_id: string
          reward_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          label?: string | null
          member_id: string
          points: number
          restaurant_id: string
          reward_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          label?: string | null
          member_id?: string
          points?: number
          restaurant_id?: string
          reward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "loyalty_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string
          restaurant_id: string
          storage_path: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          restaurant_id: string
          storage_path?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          restaurant_id?: string
          storage_path?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          popup_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          popup_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          popup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "popup_events_popup_id_fkey"
            columns: ["popup_id"]
            isOneToOne: false
            referencedRelation: "popups"
            referencedColumns: ["id"]
          },
        ]
      }
      popups: {
        Row: {
          body: string
          created_at: string
          cta_label: string
          cta_url: string
          ends_at: string | null
          frequency: string
          id: string
          image_url: string
          is_active: boolean
          restaurant_id: string
          sort_order: number
          starts_at: string | null
          target_lang: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          ends_at?: string | null
          frequency?: string
          id?: string
          image_url?: string
          is_active?: boolean
          restaurant_id: string
          sort_order?: number
          starts_at?: string | null
          target_lang?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          ends_at?: string | null
          frequency?: string
          id?: string
          image_url?: string
          is_active?: boolean
          restaurant_id?: string
          sort_order?: number
          starts_at?: string | null
          target_lang?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "popups_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_features: {
        Row: {
          allergens_enabled: boolean
          created_at: string
          crm_enabled: boolean
          crm_sender_email: string | null
          crm_sender_name: string | null
          daily_menu_enabled: boolean
          diet_profiles_enabled: boolean
          google_review_url: string | null
          id: string
          loyalty_enabled: boolean
          loyalty_points_per_visit: number
          loyalty_program_name: string | null
          loyalty_reward_threshold: number
          loyalty_welcome_text: string | null
          pick_for_me_enabled: boolean
          popups_enabled: boolean
          restaurant_id: string
          reviews_enabled: boolean
          reviews_prompt: string | null
          reviews_threshold: number
          top_dishes_enabled: boolean
          trending_enabled: boolean
          updated_at: string
        }
        Insert: {
          allergens_enabled?: boolean
          created_at?: string
          crm_enabled?: boolean
          crm_sender_email?: string | null
          crm_sender_name?: string | null
          daily_menu_enabled?: boolean
          diet_profiles_enabled?: boolean
          google_review_url?: string | null
          id?: string
          loyalty_enabled?: boolean
          loyalty_points_per_visit?: number
          loyalty_program_name?: string | null
          loyalty_reward_threshold?: number
          loyalty_welcome_text?: string | null
          pick_for_me_enabled?: boolean
          popups_enabled?: boolean
          restaurant_id: string
          reviews_enabled?: boolean
          reviews_prompt?: string | null
          reviews_threshold?: number
          top_dishes_enabled?: boolean
          trending_enabled?: boolean
          updated_at?: string
        }
        Update: {
          allergens_enabled?: boolean
          created_at?: string
          crm_enabled?: boolean
          crm_sender_email?: string | null
          crm_sender_name?: string | null
          daily_menu_enabled?: boolean
          diet_profiles_enabled?: boolean
          google_review_url?: string | null
          id?: string
          loyalty_enabled?: boolean
          loyalty_points_per_visit?: number
          loyalty_program_name?: string | null
          loyalty_reward_threshold?: number
          loyalty_welcome_text?: string | null
          pick_for_me_enabled?: boolean
          popups_enabled?: boolean
          restaurant_id?: string
          reviews_enabled?: boolean
          reviews_prompt?: string | null
          reviews_threshold?: number
          top_dishes_enabled?: boolean
          trending_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_features_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_members: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          slug: string
          subscription_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          slug: string
          subscription_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          slug?: string
          subscription_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          lang: string | null
          phone: string | null
          rating: number
          redirected_to_google: boolean
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          lang?: string | null
          phone?: string | null
          rating: number
          redirected_to_google?: boolean
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          lang?: string | null
          phone?: string | null
          rating?: number
          redirected_to_google?: boolean
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          background_color: string
          body_font: string
          button_bg_color: string
          button_text_color: string
          created_at: string
          custom_font_name: string
          custom_font_name_2: string
          custom_font_url: string
          custom_font_url_2: string
          formulas: Json
          heading_font: string
          id: string
          is_draft: boolean
          logo_url: string
          restaurant_id: string | null
          restaurant_name: string
          subtitle: string
          template_id: string
          text_color: string
          updated_at: string
        }
        Insert: {
          background_color?: string
          body_font?: string
          button_bg_color?: string
          button_text_color?: string
          created_at?: string
          custom_font_name?: string
          custom_font_name_2?: string
          custom_font_url?: string
          custom_font_url_2?: string
          formulas?: Json
          heading_font?: string
          id?: string
          is_draft?: boolean
          logo_url?: string
          restaurant_id?: string | null
          restaurant_name?: string
          subtitle?: string
          template_id?: string
          text_color?: string
          updated_at?: string
        }
        Update: {
          background_color?: string
          body_font?: string
          button_bg_color?: string
          button_text_color?: string
          created_at?: string
          custom_font_name?: string
          custom_font_name_2?: string
          custom_font_url?: string
          custom_font_url_2?: string
          formulas?: Json
          heading_font?: string
          id?: string
          is_draft?: boolean
          logo_url?: string
          restaurant_id?: string | null
          restaurant_name?: string
          subtitle?: string
          template_id?: string
          text_color?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          features: Json
          id: string
          max_dishes: number
          name: string
          price_monthly: number
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          max_dishes?: number
          name: string
          price_monthly?: number
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          max_dishes?: number
          name?: string
          price_monthly?: number
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_restaurant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      slugify: { Args: { _input: string }; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user" | "super_admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user", "super_admin"],
    },
  },
} as const
