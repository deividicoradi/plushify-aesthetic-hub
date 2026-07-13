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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          client_id: string | null
          client_name: string
          created_at: string
          duration: number
          id: string
          notes: string | null
          price: number
          professional_id: string | null
          service_id: string | null
          service_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          client_id?: string | null
          client_name: string
          created_at?: string
          duration?: number
          id?: string
          notes?: string | null
          price?: number
          professional_id?: string | null
          service_id?: string | null
          service_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          client_id?: string | null
          client_name?: string
          created_at?: string
          duration?: number
          id?: string
          notes?: string | null
          price?: number
          professional_id?: string | null
          service_id?: string | null
          service_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          reason: string | null
          record_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
          record_id: string
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
          record_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      authorization_passwords: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cash_closures: {
        Row: {
          card_amount: number
          cash_amount: number
          closed_at: string | null
          closing_balance: number
          closure_date: string
          created_at: string
          difference: number
          id: string
          notes: string | null
          opening_balance: number
          other_amount: number
          pix_amount: number
          status: string
          total_expenses: number
          total_income: number
          updated_at: string
          user_id: string
        }
        Insert: {
          card_amount?: number
          cash_amount?: number
          closed_at?: string | null
          closing_balance: number
          closure_date: string
          created_at?: string
          difference?: number
          id?: string
          notes?: string | null
          opening_balance?: number
          other_amount?: number
          pix_amount?: number
          status?: string
          total_expenses?: number
          total_income?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          card_amount?: number
          cash_amount?: number
          closed_at?: string | null
          closing_balance?: number
          closure_date?: string
          created_at?: string
          difference?: number
          id?: string
          notes?: string | null
          opening_balance?: number
          other_amount?: number
          pix_amount?: number
          status?: string
          total_expenses?: number
          total_income?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cash_openings: {
        Row: {
          card_amount: number
          cash_amount: number
          created_at: string
          id: string
          notes: string | null
          opened_at: string
          opening_balance: number
          opening_date: string
          other_amount: number
          pix_amount: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_amount?: number
          cash_amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          opening_date: string
          other_amount?: number
          pix_amount?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_amount?: number
          cash_amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          opening_date?: string
          other_amount?: number
          pix_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          last_visit: string | null
          name: string
          neighborhood: string | null
          payment_method: string | null
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_visit?: string | null
          name: string
          neighborhood?: string | null
          payment_method?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          neighborhood?: string | null
          payment_method?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_analytics: {
        Row: {
          analysis_date: string
          created_at: string
          id: string
          insights: Json
          metrics: Json
          recommendations: Json
          trends: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_date?: string
          created_at?: string
          id?: string
          insights: Json
          metrics: Json
          recommendations: Json
          trends: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_date?: string
          created_at?: string
          id?: string
          insights?: Json
          metrics?: Json
          recommendations?: Json
          trends?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          payment_method_id: string | null
          receipt_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method_id?: string | null
          receipt_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method_id?: string | null
          receipt_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          installment_number: number
          notes: string | null
          paid_amount: number
          payment_date: string | null
          payment_id: string
          status: string
          total_installments: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          notes?: string | null
          paid_amount?: number
          payment_date?: string | null
          payment_id: string
          status?: string
          total_installments: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          notes?: string | null
          paid_amount?: number
          payment_date?: string | null
          payment_id?: string
          status?: string
          total_installments?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          cost_price: number | null
          created_at: string
          id: string
          new_stock: number
          notes: string | null
          previous_stock: number
          product_id: string
          quantity: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          id?: string
          new_stock: number
          notes?: string | null
          previous_stock: number
          product_id: string
          quantity: number
          transaction_type: string
          user_id: string
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          id?: string
          new_stock?: number
          notes?: string | null
          previous_stock?: number
          product_id?: string
          quantity?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_challenges: {
        Row: {
          audience: string
          created_at: string
          description: string | null
          difficulty: string
          goal_type: string
          id: string
          period_end: string | null
          period_start: string | null
          reward: string | null
          status: string
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          goal_type?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          reward?: string | null
          status?: string
          target_value?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          goal_type?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          reward?: string | null
          status?: string
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_point_transactions: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          kind: string
          points: number
          reference_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          points?: number
          reference_id?: string | null
          source?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          points?: number
          reference_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_reward_redemptions: {
        Row: {
          client_id: string | null
          created_at: string
          estimated_value: number
          id: string
          points_used: number
          redeemed_at: string
          reward_id: string | null
          reward_title: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          estimated_value?: number
          id?: string
          points_used?: number
          redeemed_at?: string
          reward_id?: string | null
          reward_title: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          estimated_value?: number
          id?: string
          points_used?: number
          redeemed_at?: string
          reward_id?: string | null
          reward_title?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_rewards: {
        Row: {
          active: boolean
          available: boolean
          created_at: string
          description: string | null
          id: string
          points_cost: number
          popular: boolean
          reward_type: string
          tier_name: string | null
          title: string
          updated_at: string
          user_id: string
          validity_days: number | null
        }
        Insert: {
          active?: boolean
          available?: boolean
          created_at?: string
          description?: string | null
          id?: string
          points_cost?: number
          popular?: boolean
          reward_type?: string
          tier_name?: string | null
          title: string
          updated_at?: string
          user_id: string
          validity_days?: number | null
        }
        Update: {
          active?: boolean
          available?: boolean
          created_at?: string
          description?: string | null
          id?: string
          points_cost?: number
          popular?: boolean
          reward_type?: string
          tier_name?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          validity_days?: number | null
        }
        Relationships: []
      }
      loyalty_settings: {
        Row: {
          created_at: string
          how_it_works: Json
          id: string
          points_active: boolean
          points_per_currency: number
          points_validity_days: number | null
          seeded: boolean
          updated_at: string
          user_id: string
          vip_criteria: Json
        }
        Insert: {
          created_at?: string
          how_it_works?: Json
          id?: string
          points_active?: boolean
          points_per_currency?: number
          points_validity_days?: number | null
          seeded?: boolean
          updated_at?: string
          user_id: string
          vip_criteria?: Json
        }
        Update: {
          created_at?: string
          how_it_works?: Json
          id?: string
          points_active?: boolean
          points_per_currency?: number
          points_validity_days?: number | null
          seeded?: boolean
          updated_at?: string
          user_id?: string
          vip_criteria?: Json
        }
        Relationships: []
      }
      loyalty_tiers: {
        Row: {
          active: boolean
          benefit: string | null
          color: string
          created_at: string
          description: string | null
          id: string
          min_points: number
          min_spent: number
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          benefit?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          min_points?: number
          min_spent?: number
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          benefit?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          min_points?: number
          min_spent?: number
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          client_id: string | null
          created_at: string
          description: string | null
          discount: number | null
          due_date: string | null
          id: string
          installments: number
          notes: string | null
          paid_amount: number
          payment_date: string | null
          payment_method_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          installments?: number
          notes?: string | null
          paid_amount?: number
          payment_date?: string | null
          payment_method_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          installments?: number
          notes?: string | null
          paid_amount?: number
          payment_date?: string | null
          payment_method_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          acquisition_date: string | null
          active: boolean
          barcode: string | null
          brand: string | null
          category: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          min_stock_level: number | null
          name: string
          price: number
          sku: string | null
          stock_quantity: number
          updated_at: string
          user_id: string
          validity_date: string | null
        }
        Insert: {
          acquisition_date?: string | null
          active?: boolean
          barcode?: string | null
          brand?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name: string
          price?: number
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
          user_id: string
          validity_date?: string | null
        }
        Update: {
          acquisition_date?: string | null
          active?: boolean
          barcode?: string | null
          brand?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name?: string
          price?: number
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
          user_id?: string
          validity_date?: string | null
        }
        Relationships: []
      }
      professionals: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          specialties: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_professionals: {
        Row: {
          created_at: string
          id: string
          professional_id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          professional_id: string
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          professional_id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_professionals_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_professionals_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          description: string | null
          duration: number
          id: string
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          name: string
          price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          hire_date: string | null
          id: string
          name: string
          permissions: Json | null
          phone: string | null
          role: string
          salary: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          permissions?: Json | null
          phone?: string | null
          role: string
          salary?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          phone?: string | null
          role?: string
          salary?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          abacate_checkout_id: string | null
          abacate_customer_id: string | null
          abacate_subscription_id: string | null
          cancel_at_period_end: boolean
          created_at: string
          expires_at: string | null
          id: string
          payment_kind: string | null
          plan_type: Database["public"]["Enums"]["plan_type"]
          started_at: string
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abacate_checkout_id?: string | null
          abacate_customer_id?: string | null
          abacate_subscription_id?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_kind?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abacate_checkout_id?: string | null
          abacate_customer_id?: string | null
          abacate_subscription_id?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_kind?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      working_hours: {
        Row: {
          auto_complete_appointments: boolean
          auto_confirm_appointments: boolean
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_complete_appointments?: boolean
          auto_confirm_appointments?: boolean
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_complete_appointments?: boolean
          auto_confirm_appointments?: boolean
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_appointment_availability: {
        Args: {
          p_appointment_date: string
          p_appointment_time: string
          p_duration: number
          p_exclude_appointment_id?: string
          p_user_id: string
        }
        Returns: boolean
      }
      check_pending_appointments_for_day: {
        Args: { p_day_of_week: number; p_user_id: string }
        Returns: boolean
      }
      create_public_booking: {
        Args: {
          p_appointment_date: string
          p_appointment_time: string
          p_client_email: string
          p_client_name: string
          p_client_phone: string
          p_notes?: string
          p_service_id: string
        }
        Returns: string
      }
      detect_sql_injection: { Args: { input_text: string }; Returns: boolean }
      ensure_loyalty_defaults: { Args: never; Returns: undefined }
      get_available_slots: {
        Args: {
          p_date: string
          p_service_duration?: number
          p_slot_interval?: number
          p_user_id: string
        }
        Returns: {
          is_available: boolean
          slot_time: string
        }[]
      }
      get_client_data_secure: {
        Args: { p_client_id: string; p_mask_sensitive?: boolean }
        Returns: {
          address: string | null
          cep: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          last_visit: string | null
          name: string
          neighborhood: string | null
          payment_method: string | null
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "clients"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_clients_masked: {
        Args: { p_mask_sensitive?: boolean }
        Returns: {
          address: string | null
          cep: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          last_visit: string | null
          name: string
          neighborhood: string | null
          payment_method: string | null
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "clients"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_professionals_secure: {
        Args: { p_mask_sensitive?: boolean }
        Returns: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          specialties: string[] | null
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "professionals"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_available_slots: {
        Args: { p_date: string; p_service_id: string }
        Returns: {
          is_available: boolean
          slot_time: string
        }[]
      }
      get_public_services: {
        Args: never
        Returns: {
          category: string
          description: string
          duration: number
          id: string
          name: string
          price: number
        }[]
      }
      get_user_plan: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["plan_type"]
      }
      has_feature_access: { Args: { feature_name: string }; Returns: boolean }
      sanitize_input: { Args: { input_text: string }; Returns: string }
      set_authorization_password: {
        Args: { p_password: string }
        Returns: boolean
      }
      start_subscription: {
        Args: {
          p_abacate_checkout_id?: string
          p_abacate_customer_id?: string
          p_abacate_subscription_id?: string
          p_billing_interval?: string
          p_current_period_end?: string
          p_payment_kind?: string
          p_plan_code: string
          p_trial_days?: number
          p_user_id: string
        }
        Returns: string
      }
      validate_email: { Args: { email: string }; Returns: boolean }
      validate_phone: { Args: { phone: string }; Returns: boolean }
      verify_authorization_password: {
        Args: { p_password: string }
        Returns: boolean
      }
    }
    Enums: {
      plan_type: "trial" | "professional" | "premium"
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
      plan_type: ["trial", "professional", "premium"],
    },
  },
} as const
