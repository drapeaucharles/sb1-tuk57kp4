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
      properties: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          location: string | null
          minimum_bid_price: number
          available_dates: Json
          images: Json | null
          created_at: string
          total_earnings: number
          active_bids: number
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          location?: string | null
          minimum_bid_price: number
          available_dates: Json
          images?: Json | null
          created_at?: string
          total_earnings?: number
          active_bids?: number
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          location?: string | null
          minimum_bid_price?: number
          available_dates?: Json
          images?: Json | null
          created_at?: string
          total_earnings?: number
          active_bids?: number
        }
      }
      bids: {
        Row: {
          id: string
          user_id: string
          property_id: string
          nights: Json
          total_bid_amount: number
          wallet_address: string | null
          bid_status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          nights: Json
          total_bid_amount: number
          wallet_address?: string | null
          bid_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          nights?: Json
          total_bid_amount?: number
          wallet_address?: string | null
          bid_status?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          host_id: string
          property_id: string
          nights_booked: Json
          total_paid_amount: number
          booking_status: string
          payout_status: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          host_id: string
          property_id: string
          nights_booked: Json
          total_paid_amount: number
          booking_status?: string
          payout_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          host_id?: string
          property_id?: string
          nights_booked?: Json
          total_paid_amount?: number
          booking_status?: string
          payout_status?: string
          created_at?: string
        }
      }
    }
  }
}