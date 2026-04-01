export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          monthly_income: number;
          monthly_budget: number;
          current_balance: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          monthly_income?: number;
          monthly_budget?: number;
          current_balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          monthly_income?: number;
          monthly_budget?: number;
          current_balance?: number;
          currency?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          date: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          amount: number;
          category: string;
          date: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          amount?: number;
          category?: string;
          date?: string;
          note?: string | null;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          deadline: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          deadline: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          target_amount?: number;
          current_amount?: number;
          deadline?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      add_expense_with_balance: {
        Args: {
          expense_amount: number;
          expense_category: string;
          expense_date: string;
          expense_note?: string | null;
        };
        Returns: Database["public"]["Tables"]["expenses"]["Row"];
      };
      increment_goal_progress: {
        Args: {
          goal_id: string;
          contribution_amount: number;
        };
        Returns: Database["public"]["Tables"]["goals"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];

export type FieldErrors = Record<string, string[] | undefined>;

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  redirectTo?: string;
};

export const initialFormState: FormState = {
  status: "idle",
};
