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
    PostgrestVersion: "12.2.3 (519615d)"
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
        Relationships: []
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
          created_at: string
          expires_at: string | null
          id: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          started_at: string
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_contatos: {
        Row: {
          atualizado_em: string
          cliente_id: string | null
          criado_em: string
          id: string
          nome: string
          telefone: string
          ultima_interacao: string | null
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          cliente_id?: string | null
          criado_em?: string
          id?: string
          nome: string
          telefone: string
          ultima_interacao?: string | null
          user_id: string
        }
        Update: {
          atualizado_em?: string
          cliente_id?: string | null
          criado_em?: string
          id?: string
          nome?: string
          telefone?: string
          ultima_interacao?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_whatsapp_contatos_cliente_id"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_health_status: {
        Row: {
          created_at: string | null
          error_rate: number | null
          id: string
          last_check: string | null
          metadata: Json | null
          response_time: number | null
          service_name: string
          status: string
          updated_at: string | null
          uptime_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          error_rate?: number | null
          id?: string
          last_check?: string | null
          metadata?: Json | null
          response_time?: number | null
          service_name: string
          status?: string
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          error_rate?: number | null
          id?: string
          last_check?: string | null
          metadata?: Json | null
          response_time?: number | null
          service_name?: string
          status?: string
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      whatsapp_load_tests: {
        Row: {
          avg_response_time: number | null
          concurrent_users: number
          cpu_peak: number | null
          created_at: string | null
          duration_seconds: number
          end_time: string | null
          failed_requests: number | null
          id: string
          max_response_time: number | null
          memory_peak: number | null
          results: Json | null
          start_time: string | null
          status: string | null
          successful_requests: number | null
          test_name: string
          total_requests: number | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time?: number | null
          concurrent_users: number
          cpu_peak?: number | null
          created_at?: string | null
          duration_seconds: number
          end_time?: string | null
          failed_requests?: number | null
          id?: string
          max_response_time?: number | null
          memory_peak?: number | null
          results?: Json | null
          start_time?: string | null
          status?: string | null
          successful_requests?: number | null
          test_name: string
          total_requests?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time?: number | null
          concurrent_users?: number
          cpu_peak?: number | null
          created_at?: string | null
          duration_seconds?: number
          end_time?: string | null
          failed_requests?: number | null
          id?: string
          max_response_time?: number | null
          memory_peak?: number | null
          results?: Json | null
          start_time?: string | null
          status?: string | null
          successful_requests?: number | null
          test_name?: string
          total_requests?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_login_attempts: {
        Row: {
          attempt_time: string
          blocked_until: string | null
          failure_reason: string | null
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          attempt_time?: string
          blocked_until?: string | null
          failure_reason?: string | null
          id?: string
          ip_address: unknown
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          attempt_time?: string
          blocked_until?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          level: string
          message: string
          metadata: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          level?: string
          message: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          level?: string
          message?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_mensagens: {
        Row: {
          contato_id: string
          conteudo: string
          criado_em: string
          direcao: string
          horario: string
          id: string
          sessao_id: string
          status: string
          tipo: string
          user_id: string
        }
        Insert: {
          contato_id: string
          conteudo: string
          criado_em?: string
          direcao: string
          horario?: string
          id?: string
          sessao_id: string
          status?: string
          tipo?: string
          user_id: string
        }
        Update: {
          contato_id?: string
          conteudo?: string
          criado_em?: string
          direcao?: string
          horario?: string
          id?: string
          sessao_id?: string
          status?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_whatsapp_mensagens_contato_id"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_whatsapp_mensagens_sessao_id"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_mensagens_temp: {
        Row: {
          contato_id: string
          conteudo: string
          created_at: string
          direcao: string
          horario: string
          id: string
          status: string
          tipo: string
          user_id: string
        }
        Insert: {
          contato_id: string
          conteudo: string
          created_at?: string
          direcao: string
          horario?: string
          id?: string
          status?: string
          tipo?: string
          user_id: string
        }
        Update: {
          contato_id?: string
          conteudo?: string
          created_at?: string
          direcao?: string
          horario?: string
          id?: string
          status?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_mensagens_temp_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_message_queue: {
        Row: {
          contact_name: string | null
          created_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          message: string
          metadata: Json | null
          phone: string
          priority: number | null
          processed_at: string | null
          retry_count: number | null
          scheduled_at: string | null
          session_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          message: string
          metadata?: Json | null
          phone: string
          priority?: number | null
          processed_at?: string | null
          retry_count?: number | null
          scheduled_at?: string | null
          session_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          message?: string
          metadata?: Json | null
          phone?: string
          priority?: number | null
          processed_at?: string | null
          retry_count?: number | null
          scheduled_at?: string | null
          session_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          contact_name: string | null
          contact_phone: string | null
          content: string
          created_at: string
          direction: string
          id: string
          session_id: string
          status: string
          timestamp: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_name?: string | null
          contact_phone?: string | null
          content: string
          created_at?: string
          direction: string
          id?: string
          session_id: string
          status?: string
          timestamp?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_name?: string | null
          contact_phone?: string | null
          content?: string
          created_at?: string
          direction?: string
          id?: string
          session_id?: string
          status?: string
          timestamp?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_metrics: {
        Row: {
          created_at: string | null
          id: string
          labels: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          labels?: Json | null
          metric_name: string
          metric_type?: string
          metric_value: number
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          labels?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          timestamp?: string | null
        }
        Relationships: []
      }
      whatsapp_performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_type: string
          metric_unit: string
          metric_value: number
          session_id: string
          tags: Json | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_type: string
          metric_unit?: string
          metric_value: number
          session_id: string
          tags?: Json | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_type?: string
          metric_unit?: string
          metric_value?: number
          session_id?: string
          tags?: Json | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      whatsapp_refresh_tokens: {
        Row: {
          created_at: string
          encrypted_refresh_token: string
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_used_at: string | null
          refresh_token_hash: string
          revoked_at: string | null
          session_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_refresh_token: string
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_used_at?: string | null
          refresh_token_hash: string
          revoked_at?: string | null
          session_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_refresh_token?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_used_at?: string | null
          refresh_token_hash?: string
          revoked_at?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_security_logs: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          details: Json
          event_type: string
          id: string
          ip_address: unknown | null
          location_data: Json | null
          session_id: string | null
          severity: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          details?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          session_id?: string | null
          severity?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          details?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          session_id?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_session_isolation: {
        Row: {
          connection_count: number | null
          cpu_usage: number | null
          created_at: string | null
          health_status: string | null
          id: string
          instance_id: string
          last_heartbeat: string | null
          memory_usage: number | null
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_count?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          health_status?: string | null
          id?: string
          instance_id: string
          last_heartbeat?: string | null
          memory_usage?: number | null
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_count?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          health_status?: string | null
          id?: string
          instance_id?: string
          last_heartbeat?: string | null
          memory_usage?: number | null
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_session_logs: {
        Row: {
          created_at: string
          event: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          session_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_session_stats: {
        Row: {
          created_at: string
          id: string
          last_activity: string | null
          messages_received: number
          messages_sent: number
          total_contacts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity?: string | null
          messages_received?: number
          messages_sent?: number
          total_contacts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_activity?: string | null
          messages_received?: number
          messages_sent?: number
          total_contacts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          ip_address: unknown | null
          last_activity: string | null
          qr_code: string | null
          server_url: string | null
          session_id: string
          status: string
          token_expires_at: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          qr_code?: string | null
          server_url?: string | null
          session_id: string
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          qr_code?: string | null
          server_url?: string | null
          session_id?: string
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_sessoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          sessao_serializada: string | null
          status: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          sessao_serializada?: string | null
          status?: string
          user_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          sessao_serializada?: string | null
          status?: string
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
      active_whatsapp_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string | null
          ip_address: unknown | null
          last_activity: string | null
          qr_code: string | null
          server_url: string | null
          session_id: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          ip_address?: unknown | null
          last_activity?: string | null
          qr_code?: string | null
          server_url?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          ip_address?: unknown | null
          last_activity?: string | null
          qr_code?: string | null
          server_url?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonymize_client_data: {
        Args: { p_client_id: string }
        Returns: boolean
      }
      auto_complete_appointments: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      auto_confirm_appointments: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      can_add_team_member: {
        Args: { user_uuid?: string }
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
      check_suspicious_login_attempts: {
        Args: {
          p_ip_address: unknown
          p_max_attempts?: number
          p_time_window_minutes?: number
          p_user_id: string
        }
        Returns: {
          attempts_count: number
          blocked_until: string
          is_blocked: boolean
          severity: string
        }[]
      }
      cleanup_expired_refresh_tokens: {
        Args: Record<PropertyKey, never>
        Returns: {
          expired_tokens_cleaned: number
          old_tokens_cleaned: number
          revoked_tokens_cleaned: number
        }[]
      }
      cleanup_expired_whatsapp_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleaned_tokens: number
          expired_sessions: number
          old_logs: number
        }[]
      }
      cleanup_expired_whatsapp_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_monitoring_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_whatsapp_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleaned_messages: number
          cleaned_metrics: number
          cleaned_sessions: number
        }[]
      }
      complete_message_processing: {
        Args: {
          p_error_message?: string
          p_queue_id: string
          p_success: boolean
        }
        Returns: undefined
      }
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
      create_whatsapp_alert: {
        Args: {
          p_alert_type: string
          p_description?: string
          p_metadata?: Json
          p_severity?: string
          p_title?: string
        }
        Returns: string
      }
      create_whatsapp_refresh_token: {
        Args: {
          p_expires_at: string
          p_ip_address?: unknown
          p_refresh_token: string
          p_session_id: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      decrypt_token: {
        Args: { encrypted_token: string }
        Returns: string
      }
      detect_sql_injection: {
        Args: { input_text: string }
        Returns: boolean
      }
      encrypt_token: {
        Args: { token: string }
        Returns: string
      }
      enqueue_whatsapp_message: {
        Args: {
          p_contact_name?: string
          p_message: string
          p_phone: string
          p_priority?: number
          p_session_id: string
          p_user_id: string
        }
        Returns: string
      }
      get_active_session_for_user: {
        Args: { p_user_id: string }
        Returns: {
          expires_at: string
          id: string
          last_activity: string
          qr_code: string
          server_url: string
          session_id: string
          status: string
        }[]
      }
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
          address: string
          cep: string
          city: string
          cpf: string
          created_at: string
          email: string
          id: string
          last_visit: string
          name: string
          neighborhood: string
          payment_method: string
          phone: string
          state: string
          status: string
          updated_at: string
        }[]
      }
      get_clients_masked: {
        Args: { p_mask_sensitive?: boolean }
        Returns: {
          address: string
          cep: string
          city: string
          cpf: string
          created_at: string
          email: string
          id: string
          last_visit: string
          name: string
          neighborhood: string
          payment_method: string
          phone: string
          state: string
          status: string
          updated_at: string
        }[]
      }
      get_dashboard_summary: {
        Args: { target_user_id: string }
        Returns: {
          active_services: number
          pending_payments: number
          total_clients: number
          total_expenses: number
          total_payments: number
        }[]
      }
      get_decrypted_access_token: {
        Args: { session_id: string }
        Returns: string
      }
      get_decrypted_refresh_token: {
        Args: { session_id: string }
        Returns: string
      }
      get_plan_limits: {
        Args: { user_uuid?: string }
        Returns: {
          active_users_limit: number
          plan_name: string
        }[]
      }
      get_professionals_by_service: {
        Args: { p_service_id: string; p_user_id: string }
        Returns: {
          email: string
          id: string
          name: string
          phone: string
          specialties: string[]
        }[]
      }
      get_public_available_slots: {
        Args: { p_date: string; p_service_id: string }
        Returns: {
          is_available: boolean
          slot_time: string
        }[]
      }
      get_public_services: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          description: string
          duration: number
          id: string
          name: string
          price: number
        }[]
      }
      get_token_security_status: {
        Args: { p_user_id: string }
        Returns: {
          last_token_activity: string
          security_score: number
          suspicious_tokens: number
          tokens_expiring_soon: number
          total_active_tokens: number
        }[]
      }
      get_user_login_attempts: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          attempt_time: string
          blocked_until: string
          failure_reason: string
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string
        }[]
      }
      get_user_plan: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["plan_type"]
      }
      get_user_usage_stats: {
        Args: { user_uuid?: string }
        Returns: {
          can_add_more: boolean
          current_active_users: number
          max_users_allowed: number
          plan_name: string
        }[]
      }
      get_whatsapp_messages_secure: {
        Args: { p_limit?: number; p_offset?: number; p_session_id?: string }
        Returns: {
          contact_name: string
          contact_phone: string
          content: string
          direction: string
          id: string
          message_timestamp: string
          session_id: string
          status: string
        }[]
      }
      get_whatsapp_metrics_aggregated: {
        Args: {
          p_end_time?: string
          p_interval_minutes?: number
          p_metric_name: string
          p_start_time?: string
        }
        Returns: {
          avg_value: number
          count_values: number
          max_value: number
          min_value: number
          time_bucket: string
        }[]
      }
      get_whatsapp_security_alerts: {
        Args: { p_limit?: number; p_severity?: string; p_user_id: string }
        Returns: {
          acknowledged: boolean
          created_at: string
          details: Json
          event_type: string
          id: string
          severity: string
        }[]
      }
      get_whatsapp_stats: {
        Args: { p_user_id: string }
        Returns: {
          last_activity: string
          messages_received: number
          messages_sent: number
          total_contacts: number
        }[]
      }
      has_feature_access: {
        Args: { feature_name: string }
        Returns: boolean
      }
      log_unauthorized_access: {
        Args: {
          actual_user_id: string
          attempted_user_id: string
          table_name: string
        }
        Returns: undefined
      }
      log_whatsapp_event: {
        Args: {
          p_event_type?: string
          p_ip_address?: unknown
          p_level?: string
          p_message?: string
          p_metadata?: Json
          p_session_id?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      log_whatsapp_login_attempt: {
        Args:
          | {
              p_error_message?: string
              p_ip_address?: unknown
              p_session_id: string
              p_success?: boolean
              p_user_agent?: string
              p_user_id: string
            }
          | {
              p_failure_reason?: string
              p_ip_address: unknown
              p_success: boolean
              p_user_agent?: string
              p_user_id: string
            }
        Returns: undefined
      }
      log_whatsapp_rate_limit: {
        Args: {
          p_endpoint: string
          p_ip_address?: unknown
          p_request_count?: number
          p_user_id: string
        }
        Returns: undefined
      }
      log_whatsapp_security_event: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_location_data?: Json
          p_session_id?: string
          p_severity?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      mask_sensitive_client_data: {
        Args: { client_data: Json }
        Returns: Json
      }
      mask_sensitive_data: {
        Args: { input_text: string; mask_type?: string }
        Returns: string
      }
      process_message_queue: {
        Args: { p_batch_size?: number }
        Returns: {
          contact_name: string
          id: string
          message: string
          phone: string
          session_id: string
          user_id: string
        }[]
      }
      record_performance_metric: {
        Args: {
          p_metric_type: string
          p_metric_unit?: string
          p_metric_value: number
          p_session_id: string
          p_tags?: Json
          p_user_id: string
        }
        Returns: undefined
      }
      record_whatsapp_metric: {
        Args: {
          p_labels?: Json
          p_metric_name: string
          p_metric_type?: string
          p_metric_value: number
        }
        Returns: string
      }
      refresh_whatsapp_token: {
        Args: { p_refresh_token: string; p_user_id: string }
        Returns: {
          expires_at: string
          is_valid: boolean
          new_access_token: string
          new_refresh_token: string
          session_id: string
        }[]
      }
      revoke_all_user_tokens: {
        Args: { p_reason?: string; p_user_id: string }
        Returns: number
      }
      revoke_user_tokens_secure: {
        Args: { p_user_id?: string }
        Returns: number
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
      sanitize_input: {
        Args: { input_text: string }
        Returns: string
      }
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
      secure_token_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: {
          expired_tokens: number
          old_sessions: number
          security_issues: number
        }[]
      }
      set_authorization_password: {
        Args: { p_password: string }
        Returns: boolean
      }
      update_session_isolation: {
        Args: {
          p_connection_count?: number
          p_cpu_usage?: number
          p_health_status?: string
          p_instance_id: string
          p_memory_usage?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_whatsapp_health: {
        Args: {
          p_error_rate?: number
          p_metadata?: Json
          p_response_time?: number
          p_service_name: string
          p_status?: string
        }
        Returns: undefined
      }
      validate_client_access: {
        Args: { client_id: string; requesting_user_id: string }
        Returns: boolean
      }
      validate_cpf: {
        Args: { cpf_input: string }
        Returns: boolean
      }
      validate_email: {
        Args: { email: string }
        Returns: boolean
      }
      validate_phone: {
        Args: { phone: string }
        Returns: boolean
      }
      validate_refresh_token_secure: {
        Args: { p_token_hash: string }
        Returns: {
          is_valid: boolean
          session_id: string
          user_id: string
        }[]
      }
      validate_refresh_token_security: {
        Args: { p_session_id: string; p_token_hash: string; p_user_id: string }
        Returns: {
          expires_in_seconds: number
          is_valid: boolean
          remaining_uses: number
          security_status: string
        }[]
      }
      validate_session_secure: {
        Args: { p_session_id: string }
        Returns: {
          is_valid: boolean
          status: string
          user_id: string
        }[]
      }
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
      verify_user_access: {
        Args: { target_user_id: string }
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
