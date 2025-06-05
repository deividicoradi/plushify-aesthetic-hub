
export interface CheckoutRequest {
  planId: string;
  isYearly: boolean;
}

export interface PlanConfig {
  name: string;
  unitAmount: number;
}

export interface CheckoutResponse {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}
