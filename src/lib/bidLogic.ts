import { supabase } from './supabase';

interface BidNight {
  date: string;
  bid_price: number;
}

interface BidParams {
  property_id: string;
  user_id: string;
  nights: BidNight[];
  deposit_amount: number;
}

export async function placeBidWithConflictResolution({ 
  property_id, 
  user_id, 
  nights,
  deposit_amount
}: BidParams) {
  try {
    // Start transaction
    const { data: existingBids, error: fetchError } = await supabase
      .from('bids')
      .select('*')
      .eq('property_id', property_id)
      .in('status', ['pending', 'won'])
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    // Find overlapping bids
    const overlapping = (existingBids || []).filter(bid => {
      const bidNights = bid.nights as BidNight[];
      return bidNights.some(n => 
        nights.some(newNight => newNight.date === n.date)
      );
    });

    // Calculate new bid prices
    const outbidNights = nights.map(night => {
      const existingBid = overlapping
        .map(bid => (bid.nights as BidNight[])
          .find(n => n.date === night.date))
        .filter(Boolean)
        .sort((a, b) => b!.bid_price - a!.bid_price)[0];

      return {
        date: night.date,
        bid_price: existingBid 
          ? existingBid.bid_price + 5 // Outbid by $5
          : night.bid_price
      };
    });

    const total_amount = outbidNights.reduce((sum, n) => sum + n.bid_price, 0);

    // Insert new bid
    const { data: newBid, error: insertError } = await supabase
      .from('bids')
      .insert({
        property_id,
        user_id,
        nights: outbidNights,
        total_amount,
        deposit_amount,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update overlapping bids to outbid status
    if (overlapping.length > 0) {
      const { error: updateError } = await supabase
        .from('bids')
        .update({ status: 'outbid' })
        .in('id', overlapping.map(b => b.id));

      if (updateError) throw updateError;

      // Refund outbid users
      for (const bid of overlapping) {
        await supabase.rpc('refund_user_balance', {
          user_id: bid.user_id,
          amount: bid.total_amount + bid.deposit_amount
        });
      }
    }

    return { bid: newBid, outbidCount: overlapping.length };
  } catch (error) {
    console.error('Error placing bid:', error);
    throw error;
  }
}