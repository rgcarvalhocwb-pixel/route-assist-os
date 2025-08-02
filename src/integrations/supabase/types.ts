export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string
          alarm_chip: string | null
          client_routine: string | null
          contract_details: Json | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          monitored_areas: string | null
          name: string
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          updated_at: string
          zins_account: string | null
        }
        Insert: {
          address: string
          alarm_chip?: string | null
          client_routine?: string | null
          contract_details?: Json | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          monitored_areas?: string | null
          name: string
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          updated_at?: string
          zins_account?: string | null
        }
        Update: {
          address?: string
          alarm_chip?: string | null
          client_routine?: string | null
          contract_details?: Json | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          monitored_areas?: string | null
          name?: string
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          updated_at?: string
          zins_account?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          client_id: string
          created_at: string
          id: string
          installation_date: string | null
          installation_location: string | null
          manufacturer: string | null
          model: string | null
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          installation_date?: string | null
          installation_location?: string | null
          manufacturer?: string | null
          model?: string | null
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          installation_date?: string | null
          installation_location?: string | null
          manufacturer?: string | null
          model?: string | null
          type?: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          client_id: string
          created_at: string
          description: string
          id: string
          location_details: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string | null
          status: Database["public"]["Enums"]["incident_status"]
          type: Database["public"]["Enums"]["incident_type"]
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description: string
          id?: string
          location_details?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          type: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string
          id?: string
          location_details?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          type?: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          address: string
          client_id: string | null
          client_name: string
          created_at: string
          estimated_time: number | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          route_id: string
          sequence_order: number | null
          status: string | null
        }
        Insert: {
          address: string
          client_id?: string | null
          client_name: string
          created_at?: string
          estimated_time?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          route_id: string
          sequence_order?: number | null
          status?: string | null
        }
        Update: {
          address?: string
          client_id?: string | null
          client_name?: string
          created_at?: string
          estimated_time?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          route_id?: string
          sequence_order?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string
          description: string | null
          fuel_estimate: number | null
          id: string
          name: string
          status: string | null
          total_distance: number | null
          total_time: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          fuel_estimate?: number | null
          id?: string
          name: string
          status?: string | null
          total_distance?: number | null
          total_time?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          fuel_estimate?: number | null
          id?: string
          name?: string
          status?: string | null
          total_distance?: number | null
          total_time?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      service_order_equipment: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          service_order_id: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          service_order_id: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          service_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_equipment_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          client_id: string
          client_signature: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          photos: string[] | null
          scheduled_date: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          started_at: string | null
          status: Database["public"]["Enums"]["os_status"]
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          client_signature?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          scheduled_date?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["os_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_signature?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          scheduled_date?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["os_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      equipment_type:
        | "camera"
        | "alarm"
        | "electric_fence"
        | "dvr"
        | "sensor"
        | "siren"
        | "other"
      incident_status: "open" | "resolved" | "in_progress"
      incident_type:
        | "invasion_detected"
        | "power_failure"
        | "communication_failure"
        | "maintenance_pending"
        | "technical_support"
      os_status: "open" | "in_progress" | "completed" | "cancelled"
      risk_level: "low" | "medium" | "high" | "critical"
      service_type:
        | "preventive_maintenance"
        | "corrective_maintenance"
        | "installation"
        | "inspection"
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
      equipment_type: [
        "camera",
        "alarm",
        "electric_fence",
        "dvr",
        "sensor",
        "siren",
        "other",
      ],
      incident_status: ["open", "resolved", "in_progress"],
      incident_type: [
        "invasion_detected",
        "power_failure",
        "communication_failure",
        "maintenance_pending",
        "technical_support",
      ],
      os_status: ["open", "in_progress", "completed", "cancelled"],
      risk_level: ["low", "medium", "high", "critical"],
      service_type: [
        "preventive_maintenance",
        "corrective_maintenance",
        "installation",
        "inspection",
      ],
    },
  },
} as const
