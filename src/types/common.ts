// Common types to avoid duplication across components
export interface BaseUser {
  id: string;
  email?: string;
  name?: string;
}

export interface BaseTableItem {
  id: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

// Common form states
export interface FormState<T> extends LoadingState {
  data: T;
  isValid: boolean;
  isDirty: boolean;
}

// Financial related types
export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
}

export interface PaymentData {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  payment_date: string;
  method: string;
}

// Analytics types
export interface AnalyticsMetrics {
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// Component props patterns
export interface BaseCardProps {
  title?: string;
  description?: string;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export interface BaseFormProps<T> {
  initialData?: T;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}