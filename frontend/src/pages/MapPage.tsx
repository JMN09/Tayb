import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Paper,
  Button,
  ButtonGroup,
  Tooltip,
  Stack,
  Slider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMapEvents, 
  useMap,
  Circle
} from 'react-leaflet';
import Navbar from '../components/Navbar';
import { getRestaurants, Restaurant } from '../services/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import TuneIcon from '@mui/icons-material/Tune';

// Import Leaflet CSS - add this to your index.html or import here
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons not displaying properly
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Custom pin icon (red)
const PinIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks and pin placement
interface MapClickHandlerProps {
  isPinPlacementMode: boolean;
  onPinPlace: (position: [number, number]) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ isPinPlacementMode, onPinPlace }) => {
  const map = useMapEvents({
    click: (e) => {
      if (isPinPlacementMode) {
        onPinPlace([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  
  // Set cursor style based on mode
  useEffect(() => {
    if (isPinPlacementMode) {
      document.getElementById('map-container')?.classList.add('pin-placement-active');
    } else {
      document.getElementById('map-container')?.classList.remove('pin-placement-active');
    }
  }, [isPinPlacementMode]);
  
  return null;
};

// Radius marks for the slider
const radiusMarks = [
  { value: 1, label: '1km' },
  { value: 3, label: '3km' },
  { value: 5, label: '5km' },
  { value: 7, label: '7km' },
  { value: 10, label: '10km' },
];

const MapPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPinPlacementMode, setIsPinPlacementMode] = useState(false);
  const [pinPosition, setPinPosition] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<number>(3); // Default radius: 3km
  const [showRadiusControls, setShowRadiusControls] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Center coordinates for Lebanon (approximate)
  const mapCenter: [number, number] = [33.8938, 35.5018]; // Beirut coordinates

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await getRestaurants();
        setRestaurants(data);
      } catch (err) {
        console.error("Failed to fetch restaurants", err);
        setError("Failed to load restaurant data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
    
    // Add CSS for cursor styling
    const style = document.createElement('style');
    style.innerHTML = `
      .pin-placement-active {
        cursor: crosshair !important;
      }
      .leaflet-container {
        cursor: grab;
      }
      .leaflet-marker-draggable {
        cursor: move;
      }
      .radius-circle {
        stroke: #3f51b5;
        stroke-width: 3;
        fill: #3f51b5;
        fill-opacity: 0.1;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const togglePinPlacementMode = () => {
    setIsPinPlacementMode(prev => !prev);
    if (isPinPlacementMode) {
      // Exiting pin placement mode without placing a pin, reset cursor
      document.getElementById('map-container')?.classList.remove('pin-placement-active');
    }
  };
  
  const handlePinPlace = useCallback((position: [number, number]) => {
    setPinPosition(position);
    setIsPinPlacementMode(false); // Exit pin placement mode after placing pin
    // Show radius controls automatically when a pin is placed
    setShowRadiusControls(true);
  }, []);
  
  const handleDragEnd = (e: L.LeafletEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setPinPosition([position.lat, position.lng]);
  };
  
  const resetPin = () => {
    setPinPosition(null);
    setShowRadiusControls(false);
  };
  
  const handleRadiusChange = (_event: Event, newValue: number | number[]) => {
    setRadius(newValue as number);
  };
  
  // Convert km to meters for the circle radius
  const radiusInMeters = radius * 1000;

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading restaurant map...
          </Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 8 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Restaurant Map
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center" 
          sx={{ mb: 2 }}
        >
          <Typography variant="body1">
            Explore {restaurants.length} restaurants across Lebanon
          </Typography>
          
          <ButtonGroup variant="contained" size="small">
            <Tooltip title={isPinPlacementMode ? "Cancel pin placement" : "Place a pin on the map"}>
              <Button 
                onClick={togglePinPlacementMode}
                color={isPinPlacementMode ? "error" : "primary"}
                startIcon={<LocationOnIcon />}
                variant={isPinPlacementMode ? "contained" : "outlined"}
              >
                {isPinPlacementMode ? "Cancel" : "Place Pin"}
              </Button>
            </Tooltip>
            {pinPosition && (
              <Tooltip title="Remove pin">
                <Button 
                  onClick={resetPin}
                  color="error"
                  startIcon={<ClearIcon />}
                >
                  Remove Pin
                </Button>
              </Tooltip>
            )}
            {pinPosition && (
              <Tooltip title={showRadiusControls ? "Hide radius controls" : "Show radius controls"}>
                <Button
                  onClick={() => setShowRadiusControls(!showRadiusControls)}
                  color="primary"
                  startIcon={<TuneIcon />}
                  variant={showRadiusControls ? "contained" : "outlined"}
                >
                  {showRadiusControls ? "Hide Radius" : "Show Radius"}
                </Button>
              </Tooltip>
            )}
          </ButtonGroup>
          
          {isPinPlacementMode && (
            <Alert severity="info" sx={{ flexGrow: 1 }}>
              Click anywhere on the map to place your pin
            </Alert>
          )}
          
          {pinPosition && !showRadiusControls && !isPinPlacementMode && (
            <Alert severity="success" sx={{ flexGrow: 1 }}>
              Pin placed at {pinPosition[0].toFixed(4)}, {pinPosition[1].toFixed(4)}. You can drag to reposition.
            </Alert>
          )}
        </Stack>
        
        <Paper 
          elevation={3} 
          sx={{ 
            height: '500px', 
            width: '100%', 
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          <div 
            id="map-container" 
            ref={mapContainerRef}
            className={isPinPlacementMode ? 'pin-placement-active' : ''}
            style={{ height: '100%', width: '100%' }}
          >
            <MapContainer 
              center={mapCenter} 
              zoom={10} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapClickHandler 
                isPinPlacementMode={isPinPlacementMode}
                onPinPlace={handlePinPlace}
              />
              
              {/* Custom pin marker with radius circle */}
              {pinPosition && (
                <>
                  <Marker 
                    position={pinPosition}
                    icon={PinIcon}
                    draggable={true}
                    eventHandlers={{
                      dragend: handleDragEnd
                    }}
                  >
                    <Popup>
                      <div>
                        <h3>Your Pin</h3>
                        <p>Latitude: {pinPosition[0].toFixed(6)}</p>
                        <p>Longitude: {pinPosition[1].toFixed(6)}</p>
                        {showRadiusControls && (
                          <p>Radius: {radius} km</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Radius circle */}
                  {showRadiusControls && (
                    <Circle 
                      center={pinPosition}
                      radius={radiusInMeters}
                      className="radius-circle"
                      pathOptions={{
                        color: '#3f51b5',
                        fillColor: '#3f51b5',
                        fillOpacity: 0.1,
                        weight: 2
                      }}
                    />
                  )}
                </>
              )}
              
              {/* Restaurant markers */}
              {restaurants.map(restaurant => {
                if (restaurant.latitude && restaurant.longitude) {
                  return (
                    <Marker 
                      key={restaurant.id} 
                      position={[restaurant.latitude, restaurant.longitude]}
                    >
                      <Popup>
                        <div>
                          <h3>{restaurant.name}</h3>
                          <p>{restaurant.location}</p>
                          {restaurant.rating && (
                            <p>Rating: {restaurant.rating} / 5</p>
                          )}
                          <Button 
                            component={RouterLink} 
                            to={`/restaurant/${restaurant.id}`}
                            variant="contained" 
                            color="primary"
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>
        </Paper>
        
        {/* Radius Slider - Moved below the map */}
        {showRadiusControls && pinPosition && (
          <Box sx={{ px: 3, py: 2, mt: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            <Typography gutterBottom>Radius: {radius} km</Typography>
            <Slider
              value={radius}
              min={1}
              max={10}
              step={0.5}
              marks={radiusMarks}
              onChange={handleRadiusChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} km`}
              aria-labelledby="radius-slider"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Showing area within {radius} km of your selected location
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default MapPage; 