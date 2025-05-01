# BnBidder - Real Estate Rental Bidding Platform

A modern platform for bidding on rental properties, built with React, Supabase, and blockchain technology.

## Features

- Real-time property bidding system
- Secure wallet integration
- Dynamic pricing based on demand
- Property management for hosts
- Automated bid resolution
- Instant refunds for outbid users

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Vite

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bnbidder.git
cd bnbidder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── lib/           # Utility functions and API clients
  ├── pages/         # Page components
  ├── store/         # Global state management
  └── types/         # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.