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
      admin_actions_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          reason: string | null
          target_user_id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          reason?: string | null
          target_user_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          reason?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
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
          reminder_sent_at: string | null
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
          reminder_sent_at?: string | null
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
          reminder_sent_at?: string | null
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
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "team_members"
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
      booking_links: {
        Row: {
          created_at: string
          slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          slug?: string
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
          machine_id: string | null
          notes: string | null
          opening_balance: number
          operator_id: string | null
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
          machine_id?: string | null
          notes?: string | null
          opening_balance?: number
          operator_id?: string | null
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
          machine_id?: string | null
          notes?: string | null
          opening_balance?: number
          operator_id?: string | null
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
          machine_id: string | null
          notes: string | null
          opened_at: string
          opening_balance: number
          opening_date: string
          operator_id: string | null
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
          machine_id?: string | null
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          opening_date: string
          operator_id?: string | null
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
          machine_id?: string | null
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          opening_date?: string
          operator_id?: string | null
          other_amount?: number
          pix_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_gift_cards: {
        Row: {
          balance: number
          client_id: string
          created_at: string
          id: string
          initial_value: number
          purchased_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance: number
          client_id: string
          created_at?: string
          id?: string
          initial_value: number
          purchased_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          client_id?: string
          created_at?: string
          id?: string
          initial_value?: number
          purchased_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_gift_cards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_packages: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string
          id: string
          package_name: string
          price: number
          purchased_at: string
          service_id: string
          service_package_id: string | null
          sessions_used: number
          status: string
          total_sessions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at: string
          id?: string
          package_name: string
          price: number
          purchased_at?: string
          service_id: string
          service_package_id?: string | null
          sessions_used?: number
          status?: string
          total_sessions: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          package_name?: string
          price?: number
          purchased_at?: string
          service_id?: string
          service_package_id?: string | null
          sessions_used?: number
          status?: string
          total_sessions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_packages_service_package_id_fkey"
            columns: ["service_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
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
          return_reminder_sent_at: string | null
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
          return_reminder_sent_at?: string | null
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
          return_reminder_sent_at?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          appointment_id: string
          base_amount: number
          commission_amount: number
          commission_percent: number
          created_at: string
          id: string
          paid_at: string | null
          status: string
          team_member_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          base_amount: number
          commission_amount: number
          commission_percent: number
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: string
          team_member_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          base_amount?: number
          commission_amount?: number
          commission_percent?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: string
          team_member_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
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
      gift_card_redemptions: {
        Row: {
          amount: number
          client_gift_card_id: string
          created_at: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          client_gift_card_id: string
          created_at?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          client_gift_card_id?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_redemptions_client_gift_card_id_fkey"
            columns: ["client_gift_card_id"]
            isOneToOne: false
            referencedRelation: "client_gift_cards"
            referencedColumns: ["id"]
          },
        ]
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
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          client_id: string | null
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      package_session_usages: {
        Row: {
          appointment_id: string
          client_package_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          client_package_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          client_package_id?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_session_usages_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_session_usages_client_package_id_fkey"
            columns: ["client_package_id"]
            isOneToOne: false
            referencedRelation: "client_packages"
            referencedColumns: ["id"]
          },
        ]
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
          client_gift_card_id: string | null
          client_id: string | null
          client_package_id: string | null
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
          client_gift_card_id?: string | null
          client_id?: string | null
          client_package_id?: string | null
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
          client_gift_card_id?: string | null
          client_id?: string | null
          client_package_id?: string | null
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
            foreignKeyName: "payments_client_gift_card_id_fkey"
            columns: ["client_gift_card_id"]
            isOneToOne: false
            referencedRelation: "client_gift_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_package_id_fkey"
            columns: ["client_package_id"]
            isOneToOne: false
            referencedRelation: "client_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_upgrade_consents: {
        Row: {
          accepted_at: string
          charge_now_cents: number
          checkout_external_id: string
          created_at: string
          credit_cents: number
          id: string
          new_billing_interval: string
          new_plan_type: string
          new_price_cents: number
          previous_billing_interval: string
          previous_plan_type: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          charge_now_cents: number
          checkout_external_id: string
          created_at?: string
          credit_cents: number
          id?: string
          new_billing_interval: string
          new_plan_type: string
          new_price_cents: number
          previous_billing_interval: string
          previous_plan_type: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          charge_now_cents?: number
          checkout_external_id?: string
          created_at?: string
          credit_cents?: number
          id?: string
          new_billing_interval?: string
          new_plan_type?: string
          new_price_cents?: number
          previous_billing_interval?: string
          previous_plan_type?: string
          user_id?: string
        }
        Relationships: []
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
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          phone: string | null
          profession: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          phone?: string | null
          profession?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          profession?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_rate_limits: {
        Row: {
          endpoint: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          endpoint: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          endpoint?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_email: string | null
          referred_id: string
          referrer_id: string
          rewarded_at: string | null
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referred_email?: string | null
          referred_id: string
          referrer_id: string
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_email?: string | null
          referred_id?: string
          referrer_id?: string
          rewarded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      service_packages: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          price: number
          service_id: string
          total_sessions: number
          updated_at: string
          user_id: string
          validity_days: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          price: number
          service_id: string
          total_sessions: number
          updated_at?: string
          user_id: string
          validity_days: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          price?: number
          service_id?: string
          total_sessions?: number
          updated_at?: string
          user_id?: string
          validity_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "team_members"
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          active: boolean
          avatar_url: string | null
          commission_percent: number
          created_at: string
          email: string | null
          hire_date: string | null
          id: string
          name: string
          permissions: Json | null
          phone: string | null
          pin_hash: string | null
          role: string
          salary: number | null
          specialties: string[] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          commission_percent?: number
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          permissions?: Json | null
          phone?: string | null
          pin_hash?: string | null
          role: string
          salary?: number | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          commission_percent?: number
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          phone?: string | null
          pin_hash?: string | null
          role?: string
          salary?: number | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      terms_acceptances: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          privacy_version: string
          terms_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          privacy_version: string
          terms_version: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          privacy_version?: string
          terms_version?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          abacate_checkout_id: string | null
          abacate_customer_id: string | null
          abacate_subscription_id: string | null
          billing_interval: string | null
          cancel_at_period_end: boolean
          created_at: string
          expires_at: string | null
          id: string
          payment_kind: string | null
          plan_amount_paid: number | null
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
          billing_interval?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_kind?: string | null
          plan_amount_paid?: number | null
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
          billing_interval?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_kind?: string | null
          plan_amount_paid?: number | null
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
      admin_extend_trial: {
        Args: { p_days: number; p_reason?: string; p_user_id: string }
        Returns: Json
      }
      admin_force_cancel_subscription: {
        Args: { p_reason: string; p_user_id: string }
        Returns: Json
      }
      admin_get_customer_detail: { Args: { p_user_id: string }; Returns: Json }
      admin_get_engagement_risk: { Args: never; Returns: Json }
      admin_get_overview_details: { Args: never; Returns: Json }
      admin_get_overview_stats: { Args: never; Returns: Json }
      admin_get_pending_issues: { Args: { p_limit?: number }; Returns: Json }
      admin_get_revenue_series: {
        Args: { p_months?: number }
        Returns: {
          cancellations: number
          month_start: string
          mrr_cents: number
          new_signups: number
        }[]
      }
      admin_list_actions_log: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          action: string
          admin_email: string
          created_at: string
          details: Json
          id: string
          reason: string
          target_email: string
          total_count: number
        }[]
      }
      admin_list_admins: {
        Args: never
        Returns: {
          email: string
          granted_at: string
          granted_by_email: string
          user_id: string
        }[]
      }
      admin_list_customers: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: {
          billing_interval: string
          email: string
          expires_at: string
          last_sign_in_at: string
          payment_kind: string
          plan_type: string
          signed_up_at: string
          started_at: string
          status: string
          total_count: number
          trial_ends_at: string
          user_id: string
        }[]
      }
      admin_list_upgrade_consents: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          accepted_at: string
          charge_now_cents: number
          credit_cents: number
          email: string
          id: string
          new_plan_type: string
          new_price_cents: number
          previous_plan_type: string
          total_count: number
        }[]
      }
      admin_promote_to_admin: { Args: { p_email: string }; Returns: Json }
      admin_revoke_admin: { Args: { p_user_id: string }; Returns: Json }
      calculate_upgrade_quote: {
        Args: {
          p_new_billing_interval: string
          p_new_plan_type: string
          p_user_id: string
        }
        Returns: Json
      }
      cancel_subscription: {
        Args: {
          p_abacate_checkout_id?: string
          p_abacate_subscription_id?: string
          p_immediate?: boolean
          p_status?: string
          p_user_id: string
        }
        Returns: boolean
      }
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
      check_public_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      clear_team_member_pin: { Args: { p_member_id: string }; Returns: boolean }
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      detect_sql_injection: { Args: { input_text: string }; Returns: boolean }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
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
          return_reminder_sent_at: string | null
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
          return_reminder_sent_at: string | null
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
      get_or_create_booking_slug: { Args: never; Returns: string }
      get_or_create_referral_code: { Args: never; Returns: string }
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
        Args: { p_slug: string }
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      purchase_client_package: {
        Args: {
          p_client_id: string
          p_payment_method_id: string
          p_service_package_id: string
        }
        Returns: string
      }
      purchase_gift_card: {
        Args: {
          p_client_id: string
          p_payment_method_id: string
          p_value: number
        }
        Returns: string
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_gift_card: {
        Args: { p_amount: number; p_gift_card_id: string; p_note?: string }
        Returns: string
      }
      redeem_loyalty_reward: {
        Args: { p_client_id: string; p_reward_id: string }
        Returns: string
      }
      sanitize_input: { Args: { input_text: string }; Returns: string }
      set_authorization_password: {
        Args: { p_password: string }
        Returns: boolean
      }
      set_team_member_pin: {
        Args: { p_member_id: string; p_pin: string }
        Returns: boolean
      }
      slugify: { Args: { p_text: string }; Returns: string }
      start_subscription: {
        Args: {
          p_abacate_checkout_id?: string
          p_abacate_customer_id?: string
          p_abacate_subscription_id?: string
          p_billing_interval?: string
          p_current_period_end?: string
          p_payment_kind?: string
          p_plan_amount_paid?: number
          p_plan_code: string
          p_trial_days?: number
          p_user_id: string
        }
        Returns: string
      }
      subscribe_to_newsletter: {
        Args: { p_email: string; p_name: string }
        Returns: undefined
      }
      validate_email: { Args: { email: string }; Returns: boolean }
      validate_phone: { Args: { phone: string }; Returns: boolean }
      verify_authorization_password: {
        Args: { p_password: string }
        Returns: boolean
      }
      verify_team_member_pin: {
        Args: { p_member_id: string; p_pin: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
      plan_type: ["trial", "professional", "premium"],
    },
  },
} as const
