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
      account_deletion_log: {
        Row: {
          email_before: string
          id: string
          requested_at: string
          user_id: string
        }
        Insert: {
          email_before: string
          id?: string
          requested_at?: string
          user_id: string
        }
        Update: {
          email_before?: string
          id?: string
          requested_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      authorization_password_attempts: {
        Row: {
          created_at: string
          id: string
          success: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          success: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          success?: boolean
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
          resolution_note: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
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
          resolution_note?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
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
          resolution_note?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
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
      login_notification_state: {
        Row: {
          last_notified_at: string
          user_id: string
        }
        Insert: {
          last_notified_at: string
          user_id: string
        }
        Update: {
          last_notified_at?: string
          user_id?: string
        }
        Relationships: []
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
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          phone: string | null
          profession: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string | null
          phone?: string | null
          profession?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
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
          image_url: string | null
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
          image_url?: string | null
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
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_cancellation_feedback: {
        Row: {
          billing_interval: string | null
          comment: string | null
          created_at: string
          id: string
          reason: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          billing_interval?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          billing_interval?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_event_history: {
        Row: {
          changed_by: string | null
          created_at: string
          event_id: string
          id: string
          new_status: string
          note: string | null
          old_status: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          event_id: string
          id?: string
          new_status: string
          note?: string | null
          old_status?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          event_id?: string
          id?: string
          new_status?: string
          note?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_event_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "support_events"
            referencedColumns: ["id"]
          },
        ]
      }
      support_events: {
        Row: {
          admin_response: string | null
          created_at: string
          description: string
          event_number: number
          event_type: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          description: string
          event_number?: number
          event_type: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          description?: string
          event_number?: number
          event_type?: string
          id?: string
          priority?: string
          status?: string
          title?: string
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
          counts_as_seat: boolean
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
          counts_as_seat?: boolean
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
          counts_as_seat?: boolean
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
      wa_sessions: {
        Row: {
          connected_at: string | null
          created_at: string
          id: string
          instance_name: string
          instance_token: string | null
          phone_number: string | null
          status: string
          tenant_id: string
          updated_at: string
          warmup_started_at: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_name: string
          instance_token?: string | null
          phone_number?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          warmup_started_at?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_name?: string
          instance_token?: string | null
          phone_number?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          warmup_started_at?: string | null
        }
        Relationships: []
      }
      webhook_failures: {
        Row: {
          created_at: string
          error_message: string
          event_type: string | null
          external_id: string | null
          id: string
          payload: Json | null
          resolution_note: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          source: string
        }
        Insert: {
          created_at?: string
          error_message: string
          event_type?: string | null
          external_id?: string | null
          id?: string
          payload?: Json | null
          resolution_note?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          source: string
        }
        Update: {
          created_at?: string
          error_message?: string
          event_type?: string | null
          external_id?: string | null
          id?: string
          payload?: Json | null
          resolution_note?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          source?: string
        }
        Relationships: []
      }
      webhook_processed_events: {
        Row: {
          event_type: string | null
          id: string
          payload_hash: string
          processed_at: string
          source: string
        }
        Insert: {
          event_type?: string | null
          id?: string
          payload_hash: string
          processed_at?: string
          source: string
        }
        Update: {
          event_type?: string | null
          id?: string
          payload_hash?: string
          processed_at?: string
          source?: string
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
      admin_add_prospect_interaction: {
        Args: { p_channel: string; p_note?: string; p_prospect_id: string }
        Returns: string
      }
      admin_cancel_finance_entry: { Args: { p_id: string }; Returns: undefined }
      admin_convert_prospect: {
        Args: {
          p_converted_email?: string
          p_first_payment_value?: number
          p_id: string
        }
        Returns: undefined
      }
      admin_create_finance_entry: {
        Args: {
          p_amount: number
          p_attachment_url?: string
          p_category: string
          p_description: string
          p_due_date: string
          p_notes?: string
          p_recurrence?: string
        }
        Returns: string
      }
      admin_create_finance_note: {
        Args: { p_content?: string; p_pinned?: boolean; p_title: string }
        Returns: string
      }
      admin_create_prospect: {
        Args: {
          p_contact_channel?: string
          p_email?: string
          p_estimated_value?: number
          p_name: string
          p_notes?: string
          p_origin?: string
          p_phone?: string
          p_plan_interest?: string
          p_prospector_id?: string
          p_social_link?: string
        }
        Returns: string
      }
      admin_create_prospector: { Args: { p_name: string }; Returns: string }
      admin_delete_finance_entry: { Args: { p_id: string }; Returns: undefined }
      admin_delete_finance_note: { Args: { p_id: string }; Returns: undefined }
      admin_delete_prospect: { Args: { p_id: string }; Returns: undefined }
      admin_delete_prospector: { Args: { p_id: string }; Returns: undefined }
      admin_extend_trial: {
        Args: { p_days: number; p_reason?: string; p_user_id: string }
        Returns: Json
      }
      admin_find_duplicate_prospect: {
        Args: { p_email?: string; p_exclude_id?: string; p_phone?: string }
        Returns: {
          id: string
          matched_field: string
          name: string
          status: string
        }[]
      }
      admin_force_cancel_subscription: {
        Args: { p_reason: string; p_user_id: string }
        Returns: Json
      }
      admin_get_admin_login_log: {
        Args: { p_limit?: number }
        Returns: {
          action: string
          admin_email: string
          created_at: string
          id: string
          ip_address: string
        }[]
      }
      admin_get_customer_detail: { Args: { p_user_id: string }; Returns: Json }
      admin_get_engagement_risk: { Args: never; Returns: Json }
      admin_get_finance_summary: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          category: string
          category_total: number
          total_overdue: number
          total_paid: number
          total_pending: number
        }[]
      }
      admin_get_overview_details: { Args: never; Returns: Json }
      admin_get_overview_stats: { Args: never; Returns: Json }
      admin_get_pending_issues: { Args: { p_limit?: number }; Returns: Json }
      admin_get_prospect_interactions: {
        Args: { p_prospect_id: string }
        Returns: {
          channel: string
          created_at: string
          id: string
          note: string
          occurred_at: string
          prospect_id: string
        }[]
      }
      admin_get_prospect_metrics: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          conversion_rate: number
          loss_rate: number
          total_converted: number
          total_lost: number
          total_open: number
          total_prospected: number
        }[]
      }
      admin_get_prospector_stats: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          conversion_rate: number
          prospector_id: string
          prospector_name: string
          total_converted: number
          total_lost: number
          total_prospected: number
        }[]
      }
      admin_get_revenue_series: {
        Args: { p_months?: number }
        Returns: {
          cancellations: number
          month_start: string
          mrr_cents: number
          new_signups: number
        }[]
      }
      admin_get_stale_prospects: {
        Args: never
        Returns: {
          days_since_contact: number
          id: string
          last_contact_at: string
          name: string
          phone: string
          status: string
          urgency: string
        }[]
      }
      admin_get_support_event_detail: {
        Args: { p_event_id: string }
        Returns: Json
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
          target_deleted_at: string
          target_deleted_email_before: string
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
      admin_list_cancellations_and_refunds: {
        Args: never
        Returns: {
          billing_interval: string
          cancel_at_period_end: boolean
          comment: string
          deleted_at: string
          deleted_email_before: string
          expires_at: string
          feedback_created_at: string
          plan_amount_paid: number
          plan_type: string
          reason: string
          started_at: string
          status: string
          subscription_id: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
          user_phone: string
        }[]
      }
      admin_list_customers: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_plan_type?: string
          p_search?: string
          p_status?: string
        }
        Returns: {
          billing_interval: string
          deleted_at: string
          deleted_email_before: string
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
      admin_list_finance_entries: {
        Args: {
          p_category?: string
          p_from?: string
          p_limit?: number
          p_offset?: number
          p_status?: string
          p_to?: string
        }
        Returns: {
          amount: number
          attachment_url: string
          category: string
          created_at: string
          description: string
          due_date: string
          id: string
          notes: string
          paid_at: string
          payment_method: string
          recurrence: string
          status: string
          total_count: number
          updated_at: string
        }[]
      }
      admin_list_finance_notes: {
        Args: never
        Returns: {
          content: string
          created_at: string
          id: string
          pinned: boolean
          title: string
          updated_at: string
        }[]
      }
      admin_list_prospectors: {
        Args: never
        Returns: {
          active: boolean
          created_at: string
          id: string
          name: string
        }[]
      }
      admin_list_prospects: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_offset?: number
          p_start_date?: string
          p_status?: string
        }
        Returns: {
          contact_channel: string
          converted_at: string
          converted_user_email: string
          converted_user_id: string
          created_at: string
          email: string
          estimated_value: number
          first_payment_value: number
          id: string
          last_contact_at: string
          loss_reason: string
          name: string
          next_action_date: string
          next_action_note: string
          notes: string
          origin: string
          phone: string
          plan_interest: string
          prospector_id: string
          prospector_name: string
          social_link: string
          status: string
          total_count: number
          updated_at: string
        }[]
      }
      admin_list_support_events: {
        Args: { p_limit?: number; p_offset?: number; p_status?: string }
        Returns: {
          admin_response: string
          created_at: string
          description: string
          event_number: number
          event_type: string
          id: string
          priority: string
          status: string
          title: string
          total_count: number
          updated_at: string
          user_email: string
        }[]
      }
      admin_list_upgrade_consents: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          accepted_at: string
          charge_now_cents: number
          credit_cents: number
          deleted_at: string
          deleted_email_before: string
          email: string
          id: string
          new_plan_type: string
          new_price_cents: number
          previous_plan_type: string
          total_count: number
        }[]
      }
      admin_mark_finance_entry_paid: {
        Args: { p_id: string; p_payment_method?: string }
        Returns: undefined
      }
      admin_mark_subscription_refunded: {
        Args: {
          p_reason?: string
          p_subscription_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      admin_promote_to_admin: { Args: { p_email: string }; Returns: Json }
      admin_revoke_admin: { Args: { p_user_id: string }; Returns: Json }
      admin_set_email_failure_resolved: {
        Args: { p_id: string; p_note?: string; p_resolved: boolean }
        Returns: undefined
      }
      admin_set_prospect_status: {
        Args: { p_id: string; p_loss_reason?: string; p_status: string }
        Returns: undefined
      }
      admin_set_webhook_failure_resolved: {
        Args: { p_id: string; p_note?: string; p_resolved: boolean }
        Returns: undefined
      }
      admin_update_finance_entry: {
        Args: {
          p_amount: number
          p_attachment_url?: string
          p_category: string
          p_description: string
          p_due_date: string
          p_id: string
          p_notes?: string
          p_recurrence?: string
        }
        Returns: undefined
      }
      admin_update_finance_note: {
        Args: {
          p_content?: string
          p_id: string
          p_pinned?: boolean
          p_title: string
        }
        Returns: undefined
      }
      admin_update_prospect: {
        Args: {
          p_contact_channel?: string
          p_email?: string
          p_estimated_value?: number
          p_id: string
          p_name: string
          p_notes?: string
          p_origin?: string
          p_phone?: string
          p_plan_interest?: string
          p_prospector_id?: string
          p_social_link?: string
        }
        Returns: undefined
      }
      admin_update_prospector: {
        Args: { p_active?: boolean; p_id: string; p_name: string }
        Returns: undefined
      }
      admin_update_support_event_status: {
        Args: {
          p_admin_response?: string
          p_event_id: string
          p_new_status: string
          p_note?: string
          p_priority?: string
        }
        Returns: undefined
      }
      anonymize_account_data: { Args: never; Returns: undefined }
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
      comprehensive_security_check: {
        Args: { check_user_id: string }
        Returns: {
          check_type: string
          details: string
          status: string
          table_name: string
        }[]
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
      get_account_deletion_status: { Args: never; Returns: Json }
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
      get_my_support_events: {
        Args: never
        Returns: {
          admin_response: string
          created_at: string
          description: string
          event_number: number
          event_type: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }[]
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
          image_url: string
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
      has_role_self: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      mark_overdue_finance_entries: { Args: never; Returns: undefined }
      mfa_satisfied: { Args: never; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      notify_login: { Args: { p_user_agent?: string }; Returns: undefined }
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
      rotate_refresh_token: {
        Args: {
          p_ip_address?: unknown
          p_new_encrypted_token: string
          p_new_token_hash: string
          p_old_token_hash: string
          p_session_id: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: {
          expires_at: string
          new_token_id: string
          success: boolean
        }[]
      }
      sanitize_input: { Args: { input_text: string }; Returns: string }
      search_clients: {
        Args: { search_term?: string; target_user_id: string }
        Returns: {
          email: string
          id: string
          last_visit: string
          name: string
          phone: string
          status: string
        }[]
      }
      self_cancel_subscription: {
        Args: { p_comment?: string; p_reason?: string }
        Returns: Json
      }
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
      submit_support_event: {
        Args: {
          p_description: string
          p_event_type: string
          p_priority?: string
          p_title: string
        }
        Returns: number
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
      verify_data_integrity: {
        Args: { check_user_id: string }
        Returns: {
          status: string
          table_name: string
          total_records: number
          unauthorized_records: number
        }[]
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
