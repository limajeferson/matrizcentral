export type QuizType = "triagem" | "validacao";
export type XpActionType = "compra" | "triagem" | "download" | "validacao";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          stripe_customer_id: string | null;
          total_xp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          stripe_customer_id?: string | null;
          total_xp?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          price_cents: number;
          status: string;
          stripe_payment_id: string | null;
          downloaded: boolean;
          refund_window_expires: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          price_cents: number;
          status?: string;
          stripe_payment_id?: string | null;
          downloaded?: boolean;
          refund_window_expires?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
      };
      tokens: {
        Row: {
          token: string;
          purchase_id: string;
          profile_id: string | null;
          triaged: boolean;
          triaged_at: string | null;
          valid_until: string;
          created_at: string;
        };
        Insert: {
          token: string;
          purchase_id: string;
          profile_id?: string | null;
          triaged?: boolean;
          triaged_at?: string | null;
          valid_until: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tokens"]["Insert"]>;
      };
      quiz_responses: {
        Row: {
          id: string;
          token: string;
          quiz_type: QuizType;
          question_id: number;
          answer: string;
          is_correct: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          quiz_type: QuizType;
          question_id: number;
          answer: string;
          is_correct?: boolean | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_responses"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          description: string;
          recommended_ebooks: unknown;
          study_roadmap: Record<string, { title: string; items: string[] }>;
        };
        Insert: Database["public"]["Tables"]["profiles"]["Row"];
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      xp_events: {
        Row: {
          id: string;
          user_id: string;
          xp_amount: number;
          action_type: XpActionType;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          xp_amount: number;
          action_type: XpActionType;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["xp_events"]["Insert"]>;
      };
    };
  };
}
