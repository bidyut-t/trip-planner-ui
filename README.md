# Marriott NextGen Navigators - AI Trip Planner

A modern, AI-powered trip planning interface built for Marriott International. This application helps users plan their perfect trips with intelligent itinerary generation, real-time modifications, and interactive mapping.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## Features

- 🤖 **AI-Powered Trip Planning** - Generate detailed multi-day itineraries based on natural language prompts
- 🗺️ **Interactive Maps** - Visualize your itinerary with included (green) and excluded (red) activities
- ✏️ **Real-Time Modifications** - Update your trip plan on the fly with natural language commands
- 🏨 **Marriott Bonvoy Integration** - Earn points on partner activities and access exclusive benefits
- 💎 **Glassmorphism UI** - Modern, futuristic design with smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **npm** (version 9.x or higher) or **pnpm** (version 8.x or higher)

## Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd trip-planner-ui
```

2. **Install dependencies:**

Using npm:
```bash
npm install
```

Using pnpm:
```bash
pnpm install
```

Note: If you encounter peer dependency issues with React 19, use:
```bash
npm install --legacy-peer-deps
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory based on `.env.example`:

```bash
cp .env.example .env.local
```

Configure the following environment variables:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081

# App Configuration
NEXT_PUBLIC_APP_ENV=development

# Response Data Source (mock or api)
NEXT_PUBLIC_RESPONSE_DATA=mock
```

#### Environment Variable Details:

- **`NEXT_PUBLIC_API_BASE_URL`**: URL of the backend trip planner API server
- **`NEXT_PUBLIC_APP_ENV`**: Application environment (`development`, `staging`, or `production`)
- **`NEXT_PUBLIC_RESPONSE_DATA`**: 
  - `mock` - Uses local mock data (no backend required)
  - `api` - Fetches data from backend API (requires backend server running)

For more details, see [ENV_SETUP.md](./ENV_SETUP.md)

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
# or
pnpm dev
```

The application will be available at **http://localhost:3002**

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Project Structure

```
trip-planner-ui/
├── app/                      # Next.js app directory
│   ├── globals.css          # Global styles and animations
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page
│   └── icon.png             # Favicon/app icon
├── components/              # React components
│   ├── Background.tsx       # Animated background
│   ├── ChatInterface.tsx    # Main chat interface
│   ├── MessageBubble.tsx    # Chat message display
│   ├── ItineraryCard.tsx    # Activity card component
│   └── ItineraryMap.tsx     # Interactive Leaflet map
├── data/                    # Mock data files
│   └── marriott-nyc-activities-mock.json
├── services/                # API services
│   └── api.ts              # Backend API integration
├── types/                   # TypeScript type definitions
│   └── index.ts
├── utils/                   # Utility functions
│   ├── tripPlanner.ts      # Trip generation logic
│   ├── modificationEngine.ts # Trip modification logic
│   └── userProfile.ts      # Prompt parsing utilities
├── config/                  # Configuration files
│   └── env.ts              # Environment config
├── public/                  # Static assets
├── .env.example            # Example environment variables
├── .env.local              # Local environment variables (gitignored)
├── tailwind.config.ts      # Tailwind CSS configuration
├── next.config.ts          # Next.js configuration
└── package.json            # Project dependencies
```

## Tech Stack

### Core
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Animations** - Custom keyframe animations

### Mapping
- **Leaflet** - Interactive maps
- **React-Leaflet** - React wrapper for Leaflet

### Build Tools
- **Turbopack** - Fast bundler
- **ESLint** - Code linting

## Usage

### Basic Trip Planning

1. Enter a trip planning prompt in the chat, e.g.:
   ```
   Plan a 3-day New York trip for 2 adults and 1 kid, July 1-3. 
   We love museums and local food.
   ```

2. The AI will generate a detailed itinerary with:
   - Day-by-day activity schedule
   - Activity details (images, ratings, pricing, hours)
   - Booking options with Bonvoy points
   - Interactive map visualization

### Making Modifications

After receiving your itinerary, you can modify it with commands like:
- "Add more food spots"
- "Don't wake up before 10 AM"
- "Replace Day 2 afternoon with shopping"
- "Add a game activity on Day 1 evening"

### Viewing the Map

- **Green pins** - Activities included in your plan
- **Red pins** - Activities considered but excluded (with reasons)
- **Blue route** - Path connecting all included activities
- **Daily map links** - Open each day's route in Google Maps

## API Integration

The application can work in two modes:

### Mock Mode (Default)
- Uses local JSON data
- No backend required
- Great for development and demos
- Set `NEXT_PUBLIC_RESPONSE_DATA=mock`

### API Mode
- Connects to backend API
- Requires backend server running at `NEXT_PUBLIC_API_BASE_URL`
- Real-time trip generation
- Set `NEXT_PUBLIC_RESPONSE_DATA=api`

For API mode, ensure the backend server is running:
```bash
cd ../trip-planner-server
npm run dev
```

See [API_INTEGRATION.md](./API_INTEGRATION.md) for more details.

## Customization

### Colors

Marriott brand colors are defined in `tailwind.config.ts`:

```typescript
colors: {
  marriott: {
    red: '#DC143C',
    lightRed: '#E63946',
    coral: '#FF6B6B',
    gold: '#FFD700',
    silver: '#C0C0C0',
    platinum: '#E5E4E2',
  }
}
```

### Animations

Custom animations are defined in `app/globals.css`:
- `fadeIn`, `slideUp` - Component entry animations
- `pulseSlow`, `pulseSubtle` - Subtle element animations
- `bouncyDot` - Loading indicator
- `fadeInUp` - Staggered content display

## Troubleshooting

### Port Already in Use

If port 3002 is already in use, you can change it in `package.json`:

```json
"scripts": {
  "dev": "next dev -p 3003"
}
```

### CORS Errors (API Mode)

Ensure the backend server has CORS configured for `http://localhost:3002`. Check `trip-planner-server/src/index.ts`:

```typescript
app.use(cors({
  origin: 'http://localhost:3002',
  // ...
}));
```

### Map Not Loading

If the map doesn't load:
1. Check browser console for errors
2. Ensure Leaflet CSS is imported in `layout.tsx`
3. Verify the component is using `next/dynamic` for client-side rendering

### Dependencies Not Installing

If you encounter peer dependency conflicts:
```bash
npm install --legacy-peer-deps
```

## Contributing

1. Follow the existing code style
2. Use TypeScript strict mode
3. Add proper type definitions
4. Test on multiple browsers
5. Ensure responsive design works on mobile

## Support

For issues or questions:
- Check existing documentation in `/docs`
- Review environment setup in `ENV_SETUP.md`
- Check API integration guide in `API_INTEGRATION.md`

## License

© 2026 Marriott International. All rights reserved.

---

**Powered by Marriott International**
