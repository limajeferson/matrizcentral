export type QuizType = "triagem" | "validacao";
export type XpActionType = "compra" | "triagem" | "download" | "validacao" | "conteudo" | "roadmap" | "desafio";
export type WaitlistPlanId = "mensal_97" | "anual_497";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          stripe_customer_id: string | null;
          total_xp: number;
          display_name: string | null;
          leaderboard_opt_in: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          stripe_customer_id?: string | null;
          total_xp?: number;
          display_name?: string | null;
          leaderboard_opt_in?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          description: string;
          recommended_ebooks: unknown;
          study_roadmap: Record<string, { title: string; objective: string; checklist: string[] }>;
        };
        Insert: Database["public"]["Tables"]["profiles"]["Row"];
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
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
        Relationships: [];
      };
      content_completions: {
        Row: {
          id: string;
          token: string;
          content_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          content_id: string;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["content_completions"]["Insert"]>;
        Relationships: [];
      };
      plan_waitlist: {
        Row: {
          id: string;
          email: string;
          plan_id: WaitlistPlanId;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          plan_id: WaitlistPlanId;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plan_waitlist"]["Insert"]>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
        Relationships: [];
      };
      survey_responses: {
        Row: {
          id: string;
          token: string;
          survey_id: string;
          option_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          survey_id: string;
          option_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["survey_responses"]["Insert"]>;
        Relationships: [];
      };
      roadmap_progress: {
        Row: {
          token: string;
          stage_key: string;
          completed_at: string;
        };
        Insert: {
          token: string;
          stage_key: string;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["roadmap_progress"]["Insert"]>;
        Relationships: [];
      };
      badges_earned: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["badges_earned"]["Insert"]>;
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          certificate_type: string;
          reference_id: string;
          title: string;
          issued_at: string;
          verification_code: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          certificate_type: string;
          reference_id: string;
          title: string;
          issued_at?: string;
          verification_code: string;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>;
        Relationships: [];
      };
      challenge_claims: {
        Row: {
          id: string;
          user_id: string;
          week_key: string;
          challenge_id: string;
          claimed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_key: string;
          challenge_id: string;
          claimed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["challenge_claims"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
