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
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      dealer_requests: {
        Row: {
          business_name: string | null
          business_type: string | null
          city: string | null
          created_at: string | null
          email: string | null
          experience: string | null
          id: string
          message: string | null
          name: string
          phone: string
          state: string | null
          status: string | null
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          state?: string | null
          status?: string | null
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          state?: string | null
          status?: string | null
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          category: string | null
          client_name: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          sort_order: number | null
          title: string
        }
        Insert: {
          category?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
          title: string
        }
        Update: {
          category?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          customization: Json | null
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          size_breakup: Json | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          customization?: Json | null
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          size_breakup?: Json | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          customization?: Json | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          size_breakup?: Json | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          customer_whatsapp: string | null
          delivery_address: string | null
          id: string
          logo_url: string | null
          notes: string | null
          order_id: string
          organization: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          customer_whatsapp?: string | null
          delivery_address?: string | null
          id?: string
          logo_url?: string | null
          notes?: string | null
          order_id: string
          organization?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          customer_whatsapp?: string | null
          delivery_address?: string | null
          id?: string
          logo_url?: string | null
          notes?: string | null
          order_id?: string
          organization?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          collar_types: string[] | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          fabric: string[] | null
          featured: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean
          moq: number | null
          name: string
          short_description: string | null
          sizes: string[] | null
          sleeve_types: string[] | null
          slug: string
          sort_order: number | null
          sport_type: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          collar_types?: string[] | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          fabric?: string[] | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean
          moq?: number | null
          name: string
          short_description?: string | null
          sizes?: string[] | null
          sleeve_types?: string[] | null
          slug: string
          sort_order?: number | null
          sport_type?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          collar_types?: string[] | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          fabric?: string[] | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean
          moq?: number | null
          name?: string
          short_description?: string | null
          sizes?: string[] | null
          sleeve_types?: string[] | null
          slug?: string
          sort_order?: number | null
          sport_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          customer_whatsapp: string | null
          discount_amount: number | null
          fabric: string | null
          grand_total: number | null
          gst_amount: number | null
          id: string
          logo_url: string | null
          notes: string | null
          organization: string | null
          print_type: string | null
          product_type: string | null
          quantity: number | null
          quotation_id: string
          shipping_cost: number | null
          status: string | null
          total_amount: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          customer_whatsapp?: string | null
          discount_amount?: number | null
          fabric?: string | null
          grand_total?: number | null
          gst_amount?: number | null
          id?: string
          logo_url?: string | null
          notes?: string | null
          organization?: string | null
          print_type?: string | null
          product_type?: string | null
          quantity?: number | null
          quotation_id: string
          shipping_cost?: number | null
          status?: string | null
          total_amount?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          customer_whatsapp?: string | null
          discount_amount?: number | null
          fabric?: string | null
          grand_total?: number | null
          gst_amount?: number | null
          id?: string
          logo_url?: string | null
          notes?: string | null
          organization?: string | null
          print_type?: string | null
          product_type?: string | null
          quantity?: number | null
          quotation_id?: string
          shipping_cost?: number | null
          status?: string | null
          total_amount?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          key: string
          section: string | null
          sort_order: number | null
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          key: string
          section?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          key?: string
          section?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean | null
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          quote: string
          rating: number | null
          role: string | null
        }
        Insert: {
          approved?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          quote: string
          rating?: number | null
          role?: string | null
        }
        Update: {
          approved?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          quote?: string
          rating?: number | null
          role?: string | null
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
      generate_order_id: { Args: never; Returns: string }
      generate_quotation_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
