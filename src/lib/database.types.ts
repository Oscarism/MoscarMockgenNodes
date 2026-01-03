// ============================================
// Database Types for Supabase
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      generations: {
        Row: {
          id: string
          user_id: string
          prompt: string
          enhanced_prompt: string | null
          model: string
          aspect_ratio: string | null
          quality: string | null
          resolution: string | null
          task_id: string | null
          state: string
          result_urls: string[] | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          enhanced_prompt?: string | null
          model: string
          aspect_ratio?: string | null
          quality?: string | null
          resolution?: string | null
          task_id?: string | null
          state?: string
          result_urls?: string[] | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          enhanced_prompt?: string | null
          model?: string
          aspect_ratio?: string | null
          quality?: string | null
          resolution?: string | null
          task_id?: string | null
          state?: string
          result_urls?: string[] | null
          error_message?: string | null
          created_at?: string
        }
      }
      uploads: {
        Row: {
          id: string
          user_id: string
          file_path: string
          public_url: string
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_path: string
          public_url: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_path?: string
          public_url?: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
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
  }
}
