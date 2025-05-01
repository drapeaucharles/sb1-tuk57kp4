import { supabase } from './supabase';

export type BidStatus = 'active' | 'over_bid' | 'won' | 'canceled' | 'confirmed';

interface Bid {
  id: string;
  user_id: string;
  property_id: string;
  nights: Array<{ date: string; bid_price: number }>;
  total_amount: number;
  deposit_amount: number;
  status: BidStatus;
  created_at: string;
}

export async function cancelBidAndRefund(bidId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('cancel_bid_and_refund', {
      p_bid_id: bidId
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to cancel bid and refund:', error);
    throw error;
  }
}

export async function isBidCancelable(bidId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_bid_cancelable', {
      p_bid_id: bidId
    });

    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Failed to check if bid is cancelable:', error);
    return false;
  }
}

export async function getBidStatus(bidId: string): Promise<BidStatus | null> {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('status')
      .eq('id', bidId)
      .single();

    if (error) throw error;
    return data?.status || null;
  } catch (error) {
    console.error('Failed to get bid status:', error);
    throw error;
  }
}

export async function getUserBids(userId: string): Promise<Bid[]> {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get user bids:', error);
    throw error;
  }
}