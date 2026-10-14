export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MessageRole = "user" | "assistant";

export interface ConversationRecord {
  id: string;
  session_token_hash: string;
  title: string;
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  metadata: Json;
}

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          session_token_hash: string;
          title: string;
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          session_token_hash: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          session_token_hash?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          created_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          created_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: MessageRole;
          content?: string;
          created_at?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          }
        ];
      };
      rate_limits: {
        Row: {
          key: string;
          count: number;
          window_start: string;
          expires_at: string;
        };
        Insert: {
          key: string;
          count?: number;
          window_start?: string;
          expires_at: string;
        };
        Update: {
          key?: string;
          count?: number;
          window_start?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cleanup_expired_conversations: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      check_rate_limit: {
        Args: {
          p_key: string;
          p_max_requests: number;
          p_window_seconds: number;
        };
        Returns: {
          allowed: boolean;
          remaining: number;
          retry_after: number;
        }[];
      };
      cleanup_expired_rate_limits: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
