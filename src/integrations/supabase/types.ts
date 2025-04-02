export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_reviews: {
        Row: {
          application_id: string
          areas_to_improve: string[]
          code_quality: Json | null
          created_at: string
          id: string
          overall_recommendation: string
          score: number
          strengths: string[]
          summary: string
          updated_at: string
        }
        Insert: {
          application_id: string
          areas_to_improve: string[]
          code_quality?: Json | null
          created_at?: string
          id?: string
          overall_recommendation: string
          score: number
          strengths: string[]
          summary: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          areas_to_improve?: string[]
          code_quality?: Json | null
          created_at?: string
          id?: string
          overall_recommendation?: string
          score?: number
          strengths?: string[]
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          job_id: string
          recording_url: string | null
          started_at: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id: string
          recording_url?: string | null
          started_at?: string | null
          status: string
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id?: string
          recording_url?: string | null
          started_at?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string
          created_at: string
          deadline: string
          description: string
          id: string
          is_active: boolean | null
          recruiter_id: string
          requirements: string[]
          task_instructions: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          deadline: string
          description: string
          id?: string
          is_active?: boolean | null
          recruiter_id: string
          requirements: string[]
          task_instructions: string
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          deadline?: string
          description?: string
          id?: string
          is_active?: boolean | null
          recruiter_id?: string
          requirements?: string[]
          task_instructions?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          major: string | null
          school: string | null
          title: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          major?: string | null
          school?: string | null
          title?: string | null
          updated_at?: string
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          major?: string | null
          school?: string | null
          title?: string | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      recruiter_feedback: {
        Row: {
          application_id: string
          created_at: string
          feedback: string
          id: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          feedback: string
          id?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          feedback?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_feedback_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
