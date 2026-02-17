// Generated TypeScript types from Supabase schema
// Re-generate with: supabase gen types typescript --project-id <id> > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums
export type OrganizingPrinciple =
  | "brand"
  | "campaign"
  | "audience"
  | "channel"
  | "product"
  | "theme";

export type ProjectStatus =
  | "draft"
  | "active"
  | "in_review"
  | "approved"
  | "archived";

export type ClientStatus = "active" | "inactive" | "archived";

export type PainDesireType = "pain" | "desire";

export type HookType =
  | "question"
  | "statistic"
  | "story"
  | "contradiction"
  | "challenge"
  | "metaphor";

export type FormatType =
  | "social_post"
  | "email"
  | "ad_copy"
  | "landing_page"
  | "video_script"
  | "blog_post"
  | "headline";

export type AwarenessStage =
  | "unaware"
  | "problem_aware"
  | "solution_aware"
  | "product_aware"
  | "most_aware";

// Database interface
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          status: ClientStatus;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          status?: ClientStatus;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          status?: ClientStatus;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          client_id: string;
          owner_id: string;
          organizing_principle: OrganizingPrinciple;
          principle_rationale: string | null;
          status: ProjectStatus;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          client_id: string;
          owner_id: string;
          organizing_principle?: OrganizingPrinciple;
          principle_rationale?: string | null;
          status?: ProjectStatus;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          client_id?: string;
          owner_id?: string;
          organizing_principle?: OrganizingPrinciple;
          principle_rationale?: string | null;
          status?: ProjectStatus;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      audiences: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          demographics: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          demographics?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          demographics?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      pain_desires: {
        Row: {
          id: string;
          project_id: string;
          type: PainDesireType;
          title: string;
          description: string | null;
          intensity: number | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: PainDesireType;
          title: string;
          description?: string | null;
          intensity?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: PainDesireType;
          title?: string;
          description?: string | null;
          intensity?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      pain_desire_audiences: {
        Row: {
          id: string;
          pain_desire_id: string;
          audience_id: string;
          relevance_score: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pain_desire_id: string;
          audience_id: string;
          relevance_score?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          pain_desire_id?: string;
          audience_id?: string;
          relevance_score?: number | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      messaging_angles: {
        Row: {
          id: string;
          project_id: string;
          pain_desire_id: string | null;
          audience_id: string | null;
          title: string;
          description: string | null;
          tone: string | null;
          is_ai_generated: boolean;
          is_edited: boolean;
          lenses: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          pain_desire_id?: string | null;
          audience_id?: string | null;
          title: string;
          description?: string | null;
          tone?: string | null;
          is_ai_generated?: boolean;
          is_edited?: boolean;
          lenses?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          pain_desire_id?: string | null;
          audience_id?: string | null;
          title?: string;
          description?: string | null;
          tone?: string | null;
          is_ai_generated?: boolean;
          is_edited?: boolean;
          lenses?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      hooks: {
        Row: {
          id: string;
          messaging_angle_id: string;
          type: HookType;
          content: string;
          is_ai_generated: boolean;
          is_starred: boolean;
          awareness_stage: AwarenessStage;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          messaging_angle_id: string;
          type?: HookType;
          content: string;
          is_ai_generated?: boolean;
          is_starred?: boolean;
          awareness_stage?: AwarenessStage;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          messaging_angle_id?: string;
          type?: HookType;
          content?: string;
          is_ai_generated?: boolean;
          is_starred?: boolean;
          awareness_stage?: AwarenessStage;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      format_executions: {
        Row: {
          id: string;
          hook_id: string;
          format: FormatType;
          template_id: string | null;
          content: string;
          concept_notes: string | null;
          platform_notes: string | null;
          is_ai_generated: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hook_id: string;
          format?: FormatType;
          template_id?: string | null;
          content?: string;
          concept_notes?: string | null;
          platform_notes?: string | null;
          is_ai_generated?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hook_id?: string;
          format?: FormatType;
          template_id?: string | null;
          content?: string;
          concept_notes?: string | null;
          platform_notes?: string | null;
          is_ai_generated?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Enums: {
      organizing_principle: OrganizingPrinciple;
      project_status: ProjectStatus;
      client_status: ClientStatus;
      pain_desire_type: PainDesireType;
      hook_type: HookType;
      format_type: FormatType;
      awareness_stage: AwarenessStage;
    };
  };
}

// Convenience type helpers
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
