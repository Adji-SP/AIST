# Agricultural IoT Dashboard - Smart Farming Monitoring System

**A real-time agricultural monitoring dashboard** for precision farming and crop management. Built with React frontend and Firebase backend, featuring live sensor data visualization, weather forecasting, plant health monitoring, and comprehensive farm analytics.

> **Transform your farm into a smart, data-driven operation!** Monitor temperature, humidity, soil conditions, and environmental factors in real-time to optimize crop yields and resource efficiency.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)]()
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)]()
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)]()
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8.svg)]()
[![Lucide Icons](https://img.shields.io/badge/Lucide-Icons-f56565.svg)]()
[![Chart.js](https://img.shields.io/badge/Chart.js-4.2-ff6384.svg)]()
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952b3.svg)]()

## 🌾 Key Features

A comprehensive agricultural monitoring system designed for modern precision farming:

- **📊 Real-time Sensor Monitoring**: Live temperature, humidity, soil moisture, and environmental data tracking
- **🌱 Multi-Crop Support**: Dedicated dashboards for different crops (Nipis/Lime and Kasturi plants)
- **🗺️ Interactive Land Plot Mapping**: Google Maps integration for visualizing farm plots and sensor locations
- **☁️ Weather Integration**: Real-time weather data and 5-day forecasts for informed farming decisions
- **📈 Advanced Analytics**: Production metrics, financial tracking, and yield forecasting
- **🔔 Smart Alerts**: Automated notifications for critical sensor readings and environmental conditions
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🔥 Firebase Backend**: Cloud-based real-time database with automatic synchronization
- **📉 Rich Data Visualization**: Interactive charts, gauges, and graphs for data analysis
- **🌡️ Environmental Insights**: Farming suggestions based on current conditions and historical data
- **👥 Team Management**: Integrated team profiles and collaboration features

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│          🌾 React Agricultural Dashboard - Frontend             │
│     (Nipis/Kasturi Overview, Analytics, Maps, Forecasting)      │
├─────────────┬─────────────────┬─────────────────┬───────────────┤
│ 💾 Database │ 🌐 WebSocket    │ 🔌 Serial Comm │ 🚀 REST API   │
│   Module    │    Module       │    Module       │    Module     │
├─────────────┼─────────────────┼─────────────────┼───────────────┤
│ Firebase    │ Real-time Data  │ Arduino/ESP32   │ Express.js    │
│ Firestore   │ Broadcasting    │ Auto-detection  │ Auth & CORS   │
│ Cloud Sync  │ Sensor Updates  │ Smart Reconnect │ Rate Limiting │
└─────────────┴─────────────────┴─────────────────┴───────────────┘
         ↕                ↕                ↕               ↕
┌─────────────────────────────────────────────────────────────────┐
│  📊 Chart.js  │  🗺️ Google Maps  │  ☁️ Weather API  │ 📡 Sensors │
│  Visualizations│  Land Plot Maps   │  Forecasting     │ IoT Data   │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 **Project Structure**

Here's the agricultural dashboard project structure:

```
agricultural-dashboard/
├── 📦 package.json                     # 📋 Dependencies and scripts
├── 🔐 .env.example                    # 📝 Template for environment variables
├── 📚 README.md                       # 📖 You are here!
│
├── 📂 src/                            # ⚛️ React Application Source
│   ├── 📄 App.js                      # 🏠 Main app with routing (Nipis/Kasturi routes)
│   ├── 📄 index.js                    # ⚛️ React app entry point
│   ├── 📄 App.css                     # 🎨 Global styles
│   ├── 📄 index.css                   # 🎨 Base styles
│   │
│   ├── 📂 components/                 # 🧩 React Components
│   │   ├── 📂 dashboard/              # 📊 Dashboard Pages
│   │   │   ├── 🍋 NipisOverview.jsx   # 🌱 Lime plant monitoring dashboard
│   │   │   ├── 🟢 KasturiOverview.jsx # 🌱 Kasturi plant monitoring dashboard
│   │   │   ├── 📊 Data.jsx            # 📈 Data management page
│   │   │   ├── 💰 Finance.jsx         # 💵 Financial analytics
│   │   │   ├── 🌤️ Forecast.jsx       # ☁️ Weather & crop forecasting
│   │   │   ├── 🔧 Maintenance.jsx     # 🛠️ Equipment maintenance tracking
│   │   │   └── 👥 TeamProfile.jsx     # 👤 Team member profiles
│   │   │
│   │   ├── 📂 ui/                     # 🎨 Reusable UI Components
│   │   │   ├── 🔢 NumericDisplay.jsx  # 📟 Sensor value displays
│   │   │   ├── 🕐 DigitalClock.jsx    # ⏰ Real-time clock widget
│   │   │   ├── 🔍 SearchBar.jsx       # 🔎 Search functionality
│   │   │   ├── 📊 MetricCard.jsx      # 📈 Metric display cards
│   │   │   ├── ✅ Tasks.jsx           # 📝 Task management
│   │   │   ├── 📡 DeviceStatus.jsx    # 🔌 Sensor device status
│   │   │   ├── 📦 ProductionOverview.jsx # 🌾 Production metrics
│   │   │   ├── 🗺️ LandPlotMaps.jsx   # 🌍 Google Maps integration
│   │   │   ├── 🌱 PlantInfo.jsx       # 🌿 Plant information cards
│   │   │   ├── 💡 FarmingSuggestions.jsx # 🧠 AI farming recommendations
│   │   │   └── 🔔 Alerts.jsx          # ⚠️ Alert notifications
│   │   │
│   │   ├── 📂 charts/                 # 📈 Chart Components
│   │   │   ├── 📊 chartSetup.js       # ⚙️ Chart.js configuration
│   │   │   ├── 📊 barChart.jsx        # 📊 Bar chart component
│   │   │   ├── 📈 lineChart.jsx       # 📉 Line chart component
│   │   │   ├── 🥧 pieChart.jsx        # 🥧 Pie chart component
│   │   │   ├── 🎯 gaugeChart.jsx      # 🎯 Gauge chart component
│   │   │   └── ⬠ pentagonalChart.jsx  # ⭐ Pentagonal radar chart
│   │   │
│   │   ├── 📂 layout/                 # 🏗️ Layout Components
│   │   │   ├── 📱 header.jsx          # 🔝 App header/navbar
│   │   │   ├── 📑 sidebar.jsx         # 📂 Navigation sidebar
│   │   │   └── 📄 mainContent.jsx     # 📃 Main content wrapper
│   │   │
│   │   └── 📂 images/                 # 🖼️ Image Assets
│   │       ├── 🍋 limaunipis.png      # 🌱 Nipis/Lime plant images
│   │       ├── 🌾 sawah.jpg           # 🌾 Farm field images
│   │       └── 🏫 ITS.png             # 🏢 Institution logo
│   │
│   └── 📂 hook/                       # 🎣 Custom React Hooks
│       ├── 🔥 useFirestoreClean.js    # 📡 Firestore data hooks
│       ├── 🌐 useRealtimeClean.js     # 🔄 Real-time WebSocket hooks
│       └── 🔌 useApiClean.js          # 📞 API communication hooks
│
├── 📂 public/                         # 🌍 Public Assets
│   └── 📄 index.html                  # 🌐 HTML entry point
│
├── 📂 config/                         # ⚙️ Configuration Files
│   └── 🔧 craco.config.js             # ⚙️ CRACO/Webpack config
│
├── 📂 scripts/                        # 🔧 Utility Scripts
│   ├── 🧹 clean-locks.js              # 🗑️ Lock file cleanup
│   ├── 🚀 start-mode.js               # ▶️ Startup scripts
│   ├── 🌱 seed-database.js            # 📊 Database seeding
│   ├── 🔥 seed-firestore.js           # 📊 Firestore seeding
│   └── ⚙️ env-manager.js              # 🔐 Environment management
│
├── 📂 App/                            # 🔧 Backend Modules (Optional)
│   ├── 📂 Http/Controllers/           # 🎮 HTTP Controllers
│   │   ├── 🔐 authController.js       # 👤 Authentication
│   │   ├── 🗄️ databaseController.js   # 💾 Database operations
│   │   └── 📱 mauiController.js       # 📲 Mobile integration
│   │
│   └── 📂 modules/lib/                # 🏗️ Core Libraries
│       ├── 📂 db/                     # 💾 Database modules
│       │   ├── 🔥 firebaseDB.js       # 🔥 Firebase handler
│       │   ├── 🗄️ mysqlDB.js          # 🐬 MySQL handler
│       │   ├── ☁️ cosmosDB.js         # ☁️ Azure Cosmos DB
│       │   └── 🔧 databaseAdapter.js   # ✨ Database adapter
│       │
│       ├── 📂 com/                    # 🌐 Communication
│       │   ├── 🔌 serialCommunicator.js # 📡 Serial/IoT communication
│       │   └── 🌐 webSocketCommunicator.js # 💬 WebSocket server
│       │
│       ├── 📂 alert/                  # 🚨 Alert System
│       │   └── 📢 alertManager.js     # 🎨 Alert management
│       │
│       └── 📂 doc/                    # 📚 Documentation
│           ├── 📖 DATABASE_DOCUMENTATION.md
│           ├── 📖 FIREBASE_DOCUMENTATION.md
│           ├── 📖 SERIAL_DOCUMENTATION.md
│           ├── 📖 WEBSOCKET_DOCUMENTATION.md
│           └── 📖 AZURE_INTEGRATION.md
│
└── 📂 node_modules/                   # 📦 Dependencies (auto-generated)
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- Firebase account and project (for real-time database)
- Google Maps API key (for land plot visualization)
- Weather API key (optional - for weather forecasting)

### **Quick Setup**

1. **Clone and Install**
```bash
git clone <your-repo>
cd agricultural-dashboard
npm install
```

2. **Configure Firebase**

Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

Copy `.env.example` to `.env` and configure:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Google Maps API
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Weather API (Optional)
REACT_APP_WEATHER_API_KEY=your_weather_api_key
REACT_APP_WEATHER_API_URL=https://api.open-meteo.com/v1

# Application Configuration
REACT_APP_WS_PORT=8080
REACT_APP_API_URL=http://localhost:3000
```

3. **Setup Firestore Database**

Initialize Firestore collections:
```bash
# Run the Firestore seed script
npm run seed:firestore
```

This will create the following collections:
- `sensors` - Real-time sensor data (temperature, humidity, soil moisture)
- `plants` - Plant information (Nipis, Kasturi)
- `weather` - Weather data and forecasts
- `production` - Production metrics and yields
- `alerts` - System alerts and notifications

4. **Start the Application**

**For Development:**
```bash
# Start React development server
npm start
```

**For Production Build:**
```bash
# Build optimized production bundle
npm run build

# Serve the build
npx serve -s build
```

## 📊 **Dashboard Features**

### **🌱 Plant-Specific Dashboards**
- **Nipis (Lime) Overview**: Dedicated monitoring for lime plant cultivation
- **Kasturi Overview**: Dedicated monitoring for Kasturi plant cultivation
- **Dynamic Routing**: Automatically routes to appropriate dashboard based on sensor data

### **📈 Core Components**

#### **Sensor Monitoring**
- **Real-time Data Display**: Live updates from IoT sensors
- **Multi-Metric Tracking**: Temperature, humidity, soil moisture, light intensity
- **Historical Charts**: Line charts, bar charts, gauge displays
- **Alert Thresholds**: Automated notifications for critical values

#### **Analytics & Insights**
- **Production Metrics**: Track yields, growth rates, and harvest predictions
- **Financial Analytics**: Cost tracking, revenue projections, ROI calculations
- **Weather Forecasting**: 5-day weather forecasts with farming recommendations
- **AI Suggestions**: Data-driven farming recommendations

#### **Mapping & Visualization**
- **Google Maps Integration**: Interactive land plot visualization
- **Sensor Locations**: Pin sensor locations on farm maps
- **Multi-Plot Support**: Manage multiple farm plots
- **Satellite View**: Toggle between map and satellite views

### **Available Scripts**
```bash
npm start                # Start development server (port 3000)
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Code linting
npm run seed:firestore   # Seed Firestore database
npm run clean            # Clean lock files and cache
```

## 📚 **Technical Documentation**

Comprehensive documentation for backend modules is available in `App/modules/lib/doc/`:

- **`FIREBASE_DOCUMENTATION.md`** - Firebase/Firestore integration guide
- **`DATABASE_DOCUMENTATION.md`** - Database operations and query patterns
- **`SERIAL_DOCUMENTATION.md`** - IoT sensor communication setup
- **`WEBSOCKET_DOCUMENTATION.md`** - Real-time data streaming implementation
- **`AZURE_INTEGRATION.md`** - Azure Cosmos DB integration (optional)

## 💾 **Database Structure**

The application uses **Firebase Firestore** for real-time data synchronization:

### **Firestore Collections**

#### **`sensors` Collection**
Stores real-time sensor readings:
```javascript
{
  sample_id: "nipis_001",        // Plant identifier
  temperature: 28.5,             // °C
  humidity: 65.2,                // %
  soil_moisture: 45.8,           // %
  light_intensity: 8500,         // lux
  timestamp: Timestamp,          // Firebase timestamp
  location: { lat: -7.xxx, lng: 112.xxx }
}
```

#### **`plants` Collection**
Plant information and growth tracking:
```javascript
{
  plant_id: "nipis_001",
  plant_type: "Jeruk Nipis",     // Lime
  planted_date: Timestamp,
  expected_harvest: Timestamp,
  current_stage: "vegetative",
  health_status: "good"
}
```

#### **`weather` Collection**
Weather data and forecasts:
```javascript
{
  date: Timestamp,
  temperature_max: 32,
  temperature_min: 24,
  precipitation: 5.2,            // mm
  humidity: 70,
  wind_speed: 12                 // km/h
}
```

#### **`production` Collection**
Production and yield tracking:
```javascript
{
  harvest_date: Timestamp,
  plant_id: "nipis_001",
  yield_kg: 45.5,
  quality_grade: "A",
  revenue: 500000                // IDR
}
```

### **Firebase Configuration**

Create a `.env` file with your Firebase credentials:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

## 📡 **IoT Integration & Real-time Features**

### **Sensor Communication**
Real-time data collection from agricultural IoT sensors:
- **Supported Sensors**: Temperature, humidity, soil moisture, light intensity
- **Communication Protocols**: Serial (UART), WebSocket, HTTP API
- **Hardware Support**: Arduino, ESP32, Raspberry Pi, LoRaWAN devices
- **Auto-Detection**: Automatic sensor discovery and connection
- **Data Validation**: Real-time data validation and error handling

### **WebSocket Real-time Updates**
Live data streaming between sensors and dashboard:
- **Bi-directional Communication**: Two-way data flow for commands and readings
- **Live Updates**: Instant sensor data updates without page refresh
- **Connection Management**: Auto-reconnect on connection loss
- **Broadcasting**: Multi-client support for team collaboration

### **Custom React Hooks**

#### **`useFirestore`** - Firebase data hooks
```javascript
const sensorsData = useFirestore('sensors', {
  orderBy: { field: 'timestamp', direction: 'desc' },
  limit: 50
});
```

#### **`useWebSocketStatus`** - Real-time connection status
```javascript
const { connected, reconnecting } = useWebSocketStatus();
```

#### **`useApi`** - API communication
```javascript
const { data, loading, error } = useApi('/api/weather');
```

### **Alert & Notification System**
Smart agricultural alerts based on sensor thresholds:
- **Critical Alerts**: Temperature extremes, low soil moisture
- **Warnings**: Suboptimal conditions, maintenance reminders
- **Info**: Weather updates, harvest predictions
- **Custom Thresholds**: User-configurable alert parameters

## 🔧 **Configuration**

### **Environment Variables**
Create a `.env` file in the project root with the following configuration:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Google Maps Configuration
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Weather API Configuration
REACT_APP_WEATHER_API_KEY=your_weather_api_key
REACT_APP_WEATHER_API_URL=https://api.open-meteo.com/v1/forecast
REACT_APP_WEATHER_LAT=-7.2575  # Farm latitude
REACT_APP_WEATHER_LON=112.7521  # Farm longitude

# Application Settings
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:8080
REACT_APP_UPDATE_INTERVAL=5000  # Sensor update interval (ms)

# Dashboard Configuration
REACT_APP_DEFAULT_PLANT=nipis   # Default plant dashboard (nipis/kasturi)
REACT_APP_CHART_HISTORY_HOURS=24  # Hours of historical data to display
REACT_APP_ALERT_SOUND=true      # Enable sound alerts

# Sensor Thresholds (for alerts)
REACT_APP_TEMP_MIN=20
REACT_APP_TEMP_MAX=35
REACT_APP_HUMIDITY_MIN=50
REACT_APP_HUMIDITY_MAX=80
REACT_APP_SOIL_MOISTURE_MIN=30
```

### **Dashboard Customization**

#### **Plant-Specific Settings**
Each plant dashboard can be customized in the component files:
- `src/components/dashboard/NipisOverview.jsx` - Lime plant dashboard
- `src/components/dashboard/KasturiOverview.jsx` - Kasturi plant dashboard

#### **Alert Thresholds**
Configure alert thresholds for each sensor type:
```javascript
// In your component or config file
const THRESHOLDS = {
  temperature: { min: 20, max: 35, unit: '°C' },
  humidity: { min: 50, max: 80, unit: '%' },
  soil_moisture: { min: 30, max: 70, unit: '%' },
  light_intensity: { min: 5000, max: 50000, unit: 'lux' }
};
```

#### **Chart Configuration**
Customize charts in `src/components/charts/chartSetup.js`:
- Colors, legends, tooltips
- Update intervals and animation
- Data aggregation periods

## 🔐 **Security & Best Practices**

### **Firebase Security Rules**
Configure Firestore security rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to sensor data
    match /sensors/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Protect sensitive production data
    match /production/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **API Key Protection**
- Store all API keys in `.env` file (never commit to git)
- Use environment variables with `REACT_APP_` prefix
- Implement API key restrictions in Google Cloud Console
- Monitor API usage and set quotas

### **Data Validation**
- Real-time sensor data validation before storage
- Threshold checks for abnormal readings
- Timestamp verification for data freshness
- Schema validation for database writes

## 🚀 **Deployment**

### **Development**
```bash
# Start React development server
npm start

# Runs on http://localhost:3000
# Hot reloading enabled
```

### **Production Build**
```bash
# Create optimized production build
npm run build

# Output: build/ directory
# Serve with any static hosting service
```

### **Hosting Options**

#### **Firebase Hosting** (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Deploy
firebase deploy
```

#### **Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### **Netlify**
```bash
# Build command: npm run build
# Publish directory: build
# Drag and drop build folder to Netlify
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]
```

Build and run:
```bash
docker build -t agricultural-dashboard .
docker run -p 3000:3000 agricultural-dashboard
```

## ✅ **Implemented Features**

### **Core Dashboard**
- [x] Nipis (Lime) plant monitoring dashboard
- [x] Kasturi plant monitoring dashboard
- [x] Dynamic dashboard routing based on sensor data
- [x] Real-time sensor data display (temperature, humidity, soil moisture)
- [x] Interactive charts (Line, Bar, Pie, Gauge, Pentagonal)
- [x] Responsive design for all screen sizes

### **Data & Analytics**
- [x] Firebase Firestore integration
- [x] Real-time data synchronization
- [x] Historical data visualization
- [x] Production metrics tracking
- [x] Financial analytics dashboard
- [x] Weather forecasting integration
- [x] Custom React hooks for data management

### **UI Components**
- [x] Sidebar navigation
- [x] Header with search and clock
- [x] Metric cards for key indicators
- [x] Alert notification system
- [x] Device status indicators
- [x] Plant information cards
- [x] Farming suggestions widget
- [x] Team profile page
- [x] Google Maps land plot visualization

### **Technical Features**
- [x] Custom hooks (useFirestore, useApi, useWebSocketStatus)
- [x] Error boundaries for error handling
- [x] Loading states and skeletons
- [x] Chart.js integration with custom configurations
- [x] TailwindCSS for styling
- [x] Bootstrap 5 components
- [x] Lucide React icons

## 🚧 **Roadmap & Future Enhancements**

### **High Priority**
- [ ] User authentication and role-based access
- [ ] Push notifications for critical alerts
- [ ] Mobile app (React Native)
- [ ] Offline mode and data caching
- [ ] Export data to CSV/PDF reports
- [ ] Advanced analytics and ML predictions

### **Medium Priority**
- [ ] Multi-farm management support
- [ ] Irrigation control integration
- [ ] Pest detection and management
- [ ] Automated reporting system
- [ ] Integration with e-commerce platforms
- [ ] Voice assistant integration

### **Low Priority**
- [ ] Dark mode theme
- [ ] Multi-language support (Bahasa Indonesia, English)
- [ ] Video streaming from farm cameras
- [ ] Drone integration for aerial monitoring
- [ ] Blockchain for supply chain tracking

## 🛠️ **Development Workflow**

### **Running the Application**
```bash
# Start development server with hot reload
npm start

# The app will open at http://localhost:3000
# Changes will automatically reload the browser
```

### **Code Quality**
```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### **Building**
```bash
# Create production build
npm run build

# Output directory: build/
# Optimized and minified for production
```

### **Development Tips**
1. **Component Development**: Use React DevTools for debugging components
2. **State Management**: Check Firestore data in Firebase Console
3. **Network Debugging**: Use browser DevTools to monitor API calls
4. **Performance**: Use React Profiler to identify performance bottlenecks
5. **Styling**: TailwindCSS classes can be added directly to components

### **Testing Sensor Data**
Manually add test sensor data to Firestore:
```javascript
// In Firebase Console > Firestore Database
{
  sample_id: "nipis_test_001",
  temperature: 28.5,
  humidity: 65.2,
  soil_moisture: 45.8,
  light_intensity: 8500,
  timestamp: Firebase.firestore.Timestamp.now(),
  location: {
    lat: -7.2575,
    lng: 112.7521
  }
}
```

## 🤝 **Contributing**

We welcome contributions to improve this agricultural dashboard! Here's how you can help:

### **How to Contribute**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Contribution Ideas**
- Add new chart types for data visualization
- Improve mobile responsiveness
- Add new sensor types support
- Create additional dashboard templates
- Improve documentation
- Fix bugs and issues
- Add unit and integration tests

### **Code Style**
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Update documentation for new features

## 📄 **License**

This project is licensed under the MIT License. Feel free to use and modify for your agricultural monitoring needs.

## 👥 **Team**

This project was developed by the Institut Teknologi Sepuluh Nopember (ITS) team as part of an agricultural IoT initiative.

Visit the Team Profile page in the dashboard to learn more about the contributors.

## 📞 **Support**

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in `/App/modules/lib/doc/`

---

## 🌾 **Ready to Monitor Your Farm?**

Transform your agricultural operations with real-time data insights!

```bash
# Quick Start
git clone <your-repo>
cd agricultural-dashboard
npm install

# Configure Firebase
cp .env.example .env
# Edit .env with your Firebase credentials

# Start the dashboard
npm start
```

Visit `http://localhost:3000` and start monitoring your crops! 🌱

---

<p align="center">
  <strong>Built with ❤️ for Smart Agriculture</strong><br>
  <em>Empowering farmers with data-driven decisions</em>
</p>

---

## 📚 **Additional Resources**

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)

## 🔗 **Related Projects**

- Agricultural sensor Arduino code repository
- Mobile companion app (coming soon)
- Backend API server for sensor data processing

---

**Version**: 1.0.0
**Last Updated**: 2025
**Status**: Active Development
