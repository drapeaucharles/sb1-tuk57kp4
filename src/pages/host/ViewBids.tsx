import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, DollarSign } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const ViewBids: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Sample bids data
  const bids = [
    {
      id: '1',
      user: 'User123',
      dates: {
        checkIn: '2025-07-10',
        checkOut: '2025-07-15'
      },
      amount: 145,
      status: 'active',
      timestamp: '2025-06-20T14:45:00'
    },
    {
      id: '2',
      user: 'User456',
      dates: {
        checkIn: '2025-07-10',
        checkOut: '2025-07-15'
      },
      amount: 140,
      status: 'active',
      timestamp: '2025-06-20T12:30:00'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/host')}
        leftIcon={<ArrowLeft size={16} />}
      >
        Back to Dashboard
      </Button>

      <h1 className="text-2xl font-bold text-white mb-6">View Bids</h1>

      <div className="space-y-4">
        {bids.map(bid => (
          <Card key={bid.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User size={16} className="text-gray-400" />
                  <span className="text-white">{bid.user}</span>
                  <Badge variant="primary">Leading Bid</Badge>
                </div>
                
                <div className="flex items-center text-gray-400 text-sm mb-2">
                  <Calendar size={14} className="mr-1" />
                  <span>
                    {new Date(bid.dates.checkIn).toLocaleDateString()} - {new Date(bid.dates.checkOut).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center text-emerald-400">
                  <DollarSign size={14} className="mr-1" />
                  <span className="font-medium">{bid.amount} USDT</span>
                  <span className="text-gray-400 text-sm ml-2">per night</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-400">
                  Bid placed {new Date(bid.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ViewBids;