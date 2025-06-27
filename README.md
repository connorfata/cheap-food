# 🍕 Cheap Eats NYC

**Find real-time meals under $20 in NYC — pizza slices, delis, food trucks, and more.**

A modern React web app that helps you discover budget-friendly restaurants in New York City using real NYC Open Data. No API keys required!

![Cheap Eats NYC Screenshot](https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=400&fit=crop)

## 🌟 Features

### 🔍 **Smart Search**
- **Real-time location search** - Enter any NYC address, neighborhood, or ZIP code
- **GPS location support** - One-click current location detection
- **Intelligent geocoding** - Recognizes 20+ NYC neighborhoods and ZIP codes
- **Multi-source data** - Combines restaurant inspections and food truck data

### 📊 **Rich Filtering**
- **Price range filtering** ($, $$, $$$)
- **Cuisine categories** (Pizza, Chinese, Mexican, Thai, Indian, Halal, etc.)
- **Distance-based results** (within 3 miles)
- **Real-time filtering** without page reloads

### 🗺️ **Interactive Views**
- **List view** with restaurant cards showing ratings, prices, and addresses
- **Interactive map** with clickable markers and info popups
- **Seamless view switching** between list and map modes
- **Mobile-responsive design** for on-the-go discovery

### 📱 **User-Friendly Interface**
- **Modern UI** built with Tailwind CSS
- **Loading states** and error handling
- **Image fallbacks** for missing restaurant photos
- **Accessibility features** with proper ARIA labels

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cheap-eats-nyc.git
   cd cheap-eats-nyc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Production Build

```bash
npm run build
npm run preview
```

## 🏗️ Tech Stack

### Frontend
- **React 18** - Component-based UI library
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful SVG icons

### APIs & Data
- **NYC Open Data** - Official NYC restaurant and food vendor data
- **OpenStreetMap** - Free map tiles via Leaflet
- **Geolocation API** - Browser-native location services

### Libraries
- **Leaflet** - Interactive map implementation
- **JavaScript Fetch API** - HTTP requests (no external HTTP library needed)

## 📡 Data Sources

### Primary Data Sources
1. **[NYC Restaurant Inspections](https://data.cityofnewyork.us/resource/43nn-pn8j.json)**
   - 200K+ licensed restaurants in NYC
   - Real addresses with coordinates
   - Cuisine types and inspection data
   - Updated daily by NYC Department of Health

2. **[NYC Mobile Food Vendors](https://data.cityofnewyork.us/resource/uwyv-629c.json)**
   - Licensed food trucks and street vendors
   - GPS coordinates and permitted locations
   - Food type descriptions

### API Details
```javascript
// Example API call
const response = await fetch(
  'https://data.cityofnewyork.us/resource/43nn-pn8j.json?$limit=50&$where=latitude>40.75'
);
```

**No API keys required!** All data comes from NYC's free Open Data platform.

## 🏢 Architecture

### Component Structure
```
src/
├── App.jsx                 # Main application component
├── main.jsx               # React entry point
├── index.css              # Global styles
└── assets/                # Static assets
```

### Key Functions

#### Data Fetching
- `searchNYCRestaurants()` - Main search orchestrator
- `fetchFromDataset()` - Individual dataset fetcher
- `fetchBroaderSearch()` - Fallback for sparse results

#### Location Services
- `geocodeAddress()` - NYC-specific address to coordinates
- `getCurrentLocation()` - Browser geolocation integration
- `calculateDistance()` - Haversine distance formula

#### Data Processing
- `determineCuisineType()` - Smart cuisine classification
- `determinePriceRange()` - Price tier assignment
- `formatAddress()` - Address standardization

## 🗺️ Supported NYC Areas

### Boroughs
- **Manhattan** - All neighborhoods
- **Brooklyn** - Major areas
- **Queens** - Popular districts
- **Bronx** - Key locations
- **Staten Island** - Main areas

### Specific Neighborhoods
- Times Square, SoHo, Chinatown
- East Village, West Village, Greenwich Village
- Upper East Side, Upper West Side
- Financial District, Tribeca, Nolita
- Williamsburg, Park Slope, DUMBO
- Astoria, Long Island City, Flushing

### ZIP Code Support
```javascript
const nycZipCodes = [
  '10001', '10002', '10003', // Manhattan
  '11201', '11215', '11222', // Brooklyn
  '11101', '11104', '11106', // Queens
  // ... 50+ more ZIP codes
];
```

## 🔧 Configuration

### Environment Variables
No environment variables needed! The app uses only public APIs.

### Customization Options

#### Search Radius
```javascript
const latRange = 0.02; // ~1.4 miles
const lngRange = 0.025; // ~1.4 miles
```

#### Result Limits
```javascript
const MAX_RESULTS = 50;
const MAX_DISTANCE_MILES = 3;
```

#### Price Tiers
```javascript
const PRICE_TIERS = {
  '$': 'Under $10',
  '$$': '$10-20', 
  '$$$': '$20-35',
  '$$$$': '$35+'
};
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect your GitHub repo to Vercel**
2. **Auto-deploy on push** - No configuration needed
3. **Custom domain support** available in Vercel dashboard

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cheap-eats-nyc)

### Netlify
1. **Connect GitHub repo**
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/cheap-eats-nyc)

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy the 'dist' folder to any static hosting service
# AWS S3, GitHub Pages, Firebase Hosting, etc.
```

## 🔍 API Usage Examples

### Basic Restaurant Search
```javascript
// Search restaurants near Times Square
const response = await fetch(
  'https://data.cityofnewyork.us/resource/43nn-pn8j.json?$limit=20&$where=latitude>40.755&latitude<40.760&longitude>-73.990&longitude<-73.980'
);
```

### Category Filtering
```javascript
// Find pizza places
const response = await fetch(
  'https://data.cityofnewyork.us/resource/43nn-pn8j.json?$q=pizza&$limit=10'
);
```

### Food Truck Search
```javascript
// Find food trucks
const response = await fetch(
  'https://data.cityofnewyork.us/resource/uwyv-629c.json?$limit=15'
);
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Search by neighborhood name
- [ ] Search by ZIP code
- [ ] Search by street address
- [ ] Use current location
- [ ] Filter by price range
- [ ] Filter by cuisine type
- [ ] Switch between list/map views
- [ ] Test mobile responsiveness
- [ ] Verify error handling

### Browser Testing
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

### Performance Benchmarks
- **Initial load**: < 2 seconds
- **Search results**: < 3 seconds
- **Map rendering**: < 1 second
- **Bundle size**: < 500KB gzipped

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Contribution Guidelines
- **Follow existing code style** (Prettier configuration included)
- **Add comments** for complex logic
- **Test on multiple browsers**
- **Update README** if adding new features
- **Keep commits focused** and well-described

### Ideas for Contributions
- **More cuisine types** and food categories
- **Restaurant hours** integration
- **User reviews** from NYC 311 data
- **Accessibility improvements**
- **Performance optimizations**
- **Additional NYC datasets**

## 📈 Roadmap

### Phase 1: Core Features ✅
- [x] Basic restaurant search
- [x] NYC Open Data integration
- [x] Interactive map
- [x] Mobile responsive design

### Phase 2: Enhanced Features 🚧
- [ ] Real restaurant hours from permits
- [ ] Integration with NYC 311 complaint data
- [ ] User favorites (localStorage)
- [ ] Share functionality
- [ ] Advanced filtering (rating, distance)

### Phase 3: Advanced Features 🔮
- [ ] PWA capabilities (offline mode)
- [ ] Push notifications for deals
- [ ] Integration with delivery apps
- [ ] Community features (user photos, tips)
- [ ] Multi-language support

## 🐛 Troubleshooting

### Common Issues

#### "No restaurants found"
- **Check your location** - Make sure you're searching within NYC
- **Try broader search terms** - Use borough names instead of specific addresses
- **Click "Try NYC Data"** to test with sample data

#### Map not loading
- **Check browser console** for JavaScript errors
- **Verify internet connection** - Map tiles require network access
- **Try refreshing the page**

#### Slow search results
- **NYC Open Data API** may be experiencing high traffic
- **Search smaller areas** for faster results
- **Use specific ZIP codes** instead of neighborhood names

### Debug Mode
Open browser console (F12) to see detailed API requests and responses:
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');
```

### API Status
Check NYC Open Data status: [https://data.cityofnewyork.us/](https://data.cityofnewyork.us/)

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

This project is open source and free to use, modify, and distribute.

## 🙏 Acknowledgments

- **NYC Open Data** - For providing free, comprehensive restaurant data
- **OpenStreetMap** - For free map tiles and geocoding
- **Unsplash** - For high-quality food photography
- **Lucide** - For beautiful, consistent icons
- **Tailwind CSS** - For rapid UI development

## 📞 Support

### Getting Help
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and community support
- **Email** - [yourname@email.com] for private inquiries

### Community
- **Star the repo** ⭐ if you find it useful
- **Follow the project** for updates
- **Share with friends** who love NYC food

---

**Built with ❤️ for NYC food lovers**

*Keep it local, keep it cheap, keep it delicious!* 🗽🍕