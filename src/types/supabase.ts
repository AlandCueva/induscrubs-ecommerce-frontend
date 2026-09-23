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
      brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      colors: {
        Row: {
          color_group: string
          created_at: string
          hex: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          color_group: string
          created_at?: string
          hex: string
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          color_group?: string
          created_at?: string
          hex?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color_hex_snapshot: string
          color_name_snapshot: string
          id: string
          order_id: string
          product_name_snapshot: string
          product_variant_id: string | null
          quantity: number
          size_snapshot: string
          unit_price_snapshot: number
        }
        Insert: {
          color_hex_snapshot: string
          color_name_snapshot: string
          id?: string
          order_id: string
          product_name_snapshot: string
          product_variant_id?: string | null
          quantity: number
          size_snapshot: string
          unit_price_snapshot: number
        }
        Update: {
          color_hex_snapshot?: string
          color_name_snapshot?: string
          id?: string
          order_id?: string
          product_name_snapshot?: string
          product_variant_id?: string | null
          quantity?: number
          size_snapshot?: string
          unit_price_snapshot?: number
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
            foreignKeyName: "order_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_stock_deductions: {
        Row: {
          order_id: string
          product_variant_id: string
          quantity_deducted: number
        }
        Insert: {
          order_id: string
          product_variant_id: string
          quantity_deducted: number
        }
        Update: {
          order_id?: string
          product_variant_id?: string
          quantity_deducted?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_stock_deductions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_stock_deductions_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          discount_amount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_proof_url: string | null
          shipping_fee: number
          status: Database["public"]["Enums"]["order_status"]
          store_branch: string | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_proof_url?: string | null
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          store_branch?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_proof_url?: string | null
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          store_branch?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_colors: {
        Row: {
          color_id: string
          product_id: string
        }
        Insert: {
          color_id: string
          product_id: string
        }
        Update: {
          color_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          color_id: string | null
          created_at: string
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          color_id?: string | null
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          color_id?: string | null
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          product_id: string
          size_code: string
        }
        Insert: {
          product_id: string
          size_code: string
        }
        Update: {
          product_id?: string
          size_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sizes_size_code_fkey"
            columns: ["size_code"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["code"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_id: string
          id: string
          product_id: string
          size_code: string
          stock: number
          updated_at: string
        }
        Insert: {
          color_id: string
          id?: string
          product_id: string
          size_code: string
          stock?: number
          updated_at?: string
        }
        Update: {
          color_id?: string
          id?: string
          product_id?: string
          size_code?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_size_code_fkey"
            columns: ["size_code"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["code"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string
          created_at: string
          description: string
          discount_amount: number | null
          discount_percent: number | null
          final_price: number | null
          gender: Database["public"]["Enums"]["gender_type"]
          has_discount: boolean
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category_id: string
          created_at?: string
          description?: string
          discount_amount?: number | null
          discount_percent?: number | null
          final_price?: number | null
          gender?: Database["public"]["Enums"]["gender_type"]
          has_discount?: boolean
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category_id?: string
          created_at?: string
          description?: string
          discount_amount?: number | null
          discount_percent?: number | null
          final_price?: number | null
          gender?: Database["public"]["Enums"]["gender_type"]
          has_discount?: boolean
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      public_order_attempts: {
        Row: {
          created_at: string
          id: number
          identifier: string
        }
        Insert: {
          created_at?: string
          id?: number
          identifier: string
        }
        Update: {
          created_at?: string
          id?: number
          identifier?: string
        }
        Relationships: []
      }
      sizes: {
        Row: {
          code: string
          sort_order: number
        }
        Insert: {
          code: string
          sort_order: number
        }
        Update: {
          code?: string
          sort_order?: number
        }
        Relationships: []
      }
      vip_subscribers: {
        Row: {
          email: string
          expires_at: string
          id: string
          redeemed_at: string | null
          redeemed_order_id: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          expires_at: string
          id?: string
          redeemed_at?: string | null
          redeemed_order_id?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          expires_at?: string
          id?: string
          redeemed_at?: string | null
          redeemed_order_id?: string | null
          subscribed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_subscribers_redeemed_order_id_fkey"
            columns: ["redeemed_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_order: { Args: { p_order_id: string }; Returns: undefined }
      create_order: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address: string
          p_delivery_type: Database["public"]["Enums"]["delivery_type"]
          p_items: Json
          p_notes: string
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_payment_proof_url: string
          p_status: Database["public"]["Enums"]["order_status"]
          p_store_branch: string
        }
        Returns: string
      }
      create_public_order: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address: string
          p_delivery_type: Database["public"]["Enums"]["delivery_type"]
          p_items: Json
          p_notes: string
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_payment_proof_url: string
        }
        Returns: {
          order_number: string
          total: number
        }[]
      }
      delete_order: { Args: { p_order_id: string }; Returns: undefined }
      update_order_items: {
        Args: { p_items: Json; p_order_id: string }
        Returns: undefined
      }
    }
    Enums: {
      delivery_type: "Domicilio" | "Retiro en tienda" | "Envío nacional"
      gender_type: "Mujer" | "Hombre" | "Unisex"
      order_status: "Pendiente de verificación" | "Confirmado" | "Cancelado"
      payment_method: "Transferencia" | "PayPhone" | "Efectivo"
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
      delivery_type: ["Domicilio", "Retiro en tienda", "Envío nacional"],
      gender_type: ["Mujer", "Hombre", "Unisex"],
      order_status: ["Pendiente de verificación", "Confirmado", "Cancelado"],
      payment_method: ["Transferencia", "PayPhone", "Efectivo"],
    },
  },
} as const
