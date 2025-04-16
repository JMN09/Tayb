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
  Slider,
  Chip,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  LinearProgress,
  Zoom,
  Backdrop,
  Snackbar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMapEvents,
  Circle
} from 'react-leaflet';
// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
// Fix for Leaflet marker icons not displaying properly
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import Navbar from '../components/Navbar';
import { getRestaurants, Restaurant } from '../services/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import StarIcon from '@mui/icons-material/Star';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// LocalStorage keys
const LS_KEYS = {
  PIN_POSITION: 'tayb-map-pin-position',
  RADIUS: 'tayb-map-radius'
};

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

// Restaurant icon in radius (green)
const InRadiusIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Restaurant icon outside radius (gray)
const OutOfRadiusIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Mobile breakpoint - equivalent to md in Material UI
const MOBILE_BREAKPOINT = 900;

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// Component to handle map clicks and pin placement
interface MapClickHandlerProps {
  isPinPlacementMode: boolean;
  onPinPlace: (position: [number, number]) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ isPinPlacementMode, onPinPlace }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// Star Rating Component
const StarRating: React.FC<{ value: number }> = ({ value }) => (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <StarIcon
        key={i}
        fontSize="small"
        color={i < value ? "warning" : "disabled"}
      />
    ))}
  </Box>
);

// Radius marks for the slider
const radiusMarks = [
  { value: 1, label: '1km' },
  { value: 3, label: '3km' },
  { value: 5, label: '5km' },
  { value: 7, label: '7km' },
  { value: 10, label: '10km' },
];

// Sort options
type SortOption = 'distance' | 'rating' | 'name';

// Type for restaurant with distance
interface RestaurantWithDistance extends Restaurant {
  distance?: number;
  isInRadius?: boolean;
}

const MapPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPinPlacementMode, setIsPinPlacementMode] = useState(false);
  const [pinPosition, setPinPosition] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<number>(3); // Default radius: 3km
  const [showRadiusControls, setShowRadiusControls] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [restaurantsInRadius, setRestaurantsInRadius] = useState<RestaurantWithDistance[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('distance');
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showHelp, setShowHelp] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Is mobile check
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  
  // Center coordinates for Lebanon (approximate)
  const mapCenter: [number, number] = [33.8938, 35.5018]; // Beirut coordinates

  // Load saved pin position and radius from localStorage
  useEffect(() => {
    try {
      const savedPinPosition = localStorage.getItem(LS_KEYS.PIN_POSITION);
      const savedRadius = localStorage.getItem(LS_KEYS.RADIUS);
      
      if (savedPinPosition) {
        const position = JSON.parse(savedPinPosition) as [number, number];
        setPinPosition(position);
        setShowRadiusControls(true);
        
        // Show a welcome back message
        setSnackbarMessage("Welcome back! Your previous location has been restored.");
      }
      
      if (savedRadius) {
        setRadius(Number(savedRadius));
      }
    } catch (err) {
      console.error("Error loading saved pin position", err);
      // Silently fail - not critical
    }
  }, []);

  // Main data loading
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
      .pulse-ring {
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% {
          opacity: 0.7;
          transform: scale(0.8);
        }
        70% {
          opacity: 0.1;
          transform: scale(1.1);
        }
        100% {
          opacity: 0;
          transform: scale(1.2);
        }
      }
    `;
    document.head.appendChild(style);
    
    // Add window resize listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.head.removeChild(style);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Save pin position and radius to localStorage whenever they change
  useEffect(() => {
    if (pinPosition) {
      localStorage.setItem(LS_KEYS.PIN_POSITION, JSON.stringify(pinPosition));
    }
  }, [pinPosition]);
  
  useEffect(() => {
    localStorage.setItem(LS_KEYS.RADIUS, radius.toString());
  }, [radius]);

  const togglePinPlacementMode = () => {
    setIsPinPlacementMode(prev => !prev);
    if (isPinPlacementMode) {
      // Exiting pin placement mode without placing a pin, reset cursor
      document.getElementById('map-container')?.classList.remove('pin-placement-active');
    } else {
      // Show help message
      setSnackbarMessage("Click anywhere on the map to place your pin");
    }
  };
  
  const handlePinPlace = useCallback((position: [number, number]) => {
    setPinPosition(position);
    setIsPinPlacementMode(false); // Exit pin placement mode after placing pin
    // Show radius controls automatically when a pin is placed
    setShowRadiusControls(true);
    // Reset filtering when a new pin is placed
    setIsFiltered(false);
    setShowResultsPanel(false);
    // Show success message
    setSnackbarMessage("Pin placed successfully! Now you can set your radius.");
  }, []);
  
  const handleDragEnd = (e: L.LeafletEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setPinPosition([position.lat, position.lng]);
    // Reset filtering when pin is moved
    setIsFiltered(false);
    setShowResultsPanel(false);
  };
  
  const resetPin = () => {
    setPinPosition(null);
    setShowRadiusControls(false);
    setIsFiltered(false);
    setShowResultsPanel(false);
    
    // Reset restaurant markers to default
    const updatedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      isInRadius: undefined,
      distance: undefined
    }));
    setRestaurants(updatedRestaurants);
    setRestaurantsInRadius([]);
    
    // Remove from localStorage
    localStorage.removeItem(LS_KEYS.PIN_POSITION);
    
    // Show confirmation
    setSnackbarMessage("Pin and filters have been reset");
  };
  
  const handleRadiusChange = (_event: Event, newValue: number | number[]) => {
    setRadius(newValue as number);
    // Reset filtering when radius changes
    setIsFiltered(false);
    setShowResultsPanel(false);
  };
  
  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortOption(event.target.value as SortOption);
  };
  
  // Filter restaurants based on radius
  const filterRestaurantsByRadius = async () => {
    if (!pinPosition) return;
    
    setIsFiltering(true);
    
    // Simulate a delay for better UX (allows loading state to be seen)
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const [pinLat, pinLng] = pinPosition;
    
    // Calculate distance for each restaurant and determine if it's in radius
    const restaurantsWithDistance = restaurants.map(restaurant => {
      if (!restaurant.latitude || !restaurant.longitude) {
        return { ...restaurant, distance: Infinity, isInRadius: false };
      }
      
      const distance = calculateDistance(
        pinLat, 
        pinLng, 
        restaurant.latitude, 
        restaurant.longitude
      );
      
      return {
        ...restaurant,
        distance,
        isInRadius: distance <= radius
      };
    });
    
    // Update restaurants with distance information
    setRestaurants(restaurantsWithDistance);
    
    // Filter restaurants within radius
    const inRadius = restaurantsWithDistance.filter(r => r.isInRadius);
    setRestaurantsInRadius(inRadius);
    
    // Show confirmation
    if (inRadius.length > 0) {
      setSnackbarMessage(`Found ${inRadius.length} restaurants within ${radius}km`);
    } else {
      setSnackbarMessage(`No restaurants found within ${radius}km. Try increasing your radius.`);
    }
    
    // Set filtered state
    setIsFiltered(true);
    
    // Show results panel
    setShowResultsPanel(true);
    
    setIsFiltering(false);
  };

  // Function to toggle help dialog
  const toggleHelp = () => {
    setShowHelp(prev => !prev);
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbarMessage(null);
  };
  
  // Sort restaurants based on selected option
  const sortedRestaurants = [...restaurantsInRadius].sort((a, b) => {
    switch (sortOption) {
      case 'distance':
        return (a.distance || Infinity) - (b.distance || Infinity);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  
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
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center" 
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h4" component="h1">
            Restaurant Map
          </Typography>
          
          <Tooltip title="How to use the map">
            <Button 
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
              onClick={toggleHelp}
            >
              Help
            </Button>
          </Tooltip>
        </Stack>
        
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
              <Tooltip title="Remove pin and reset filters">
                <Button 
                  onClick={resetPin}
                  color="error"
                  startIcon={<ClearIcon />}
                >
                  Reset
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
            {pinPosition && showResultsPanel && (
              <Tooltip title="Return to full map view">
                <Button
                  onClick={() => setShowResultsPanel(false)}
                  color="primary"
                  startIcon={<MapIcon />}
                >
                  Map Only
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
          
          {isFiltered && restaurantsInRadius.length > 0 && (
            <Chip 
              icon={<RestaurantIcon />} 
              label={`${restaurantsInRadius.length} restaurants within ${radius} km`} 
              color="success" 
              variant="outlined"
            />
          )}
          
          {isFiltered && restaurantsInRadius.length === 0 && (
            <Chip 
              icon={<RestaurantIcon />} 
              label={`No restaurants within ${radius} km`} 
              color="warning" 
              variant="outlined"
            />
          )}
        </Stack>
        
        {/* Main content area - Map and Results */}
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
          {/* Map Area */}
          <Paper 
            elevation={3} 
            sx={{ 
              height: isMobile ? '400px' : '600px', 
              width: isMobile ? '100%' : showResultsPanel ? '60%' : '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
              transition: 'width 0.3s ease-in-out'
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
                    // Determine icon based on filtering state
                    let markerIcon = DefaultIcon;
                    if (isFiltered) {
                      markerIcon = restaurant.isInRadius ? InRadiusIcon : OutOfRadiusIcon;
                    }
                    
                    return (
                      <Marker 
                        key={restaurant.id} 
                        position={[restaurant.latitude, restaurant.longitude]}
                        icon={markerIcon}
                      >
                        <Popup>
                          <div>
                            <h3>{restaurant.name}</h3>
                            <p>{restaurant.location}</p>
                            {restaurant.rating && (
                              <p>Rating: {restaurant.rating} / 5</p>
                            )}
                            {restaurant.distance !== undefined && (
                              <p>Distance: {restaurant.distance.toFixed(2)} km</p>
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
            
            {/* Loading overlay during filtering */}
            {isFiltering && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  bgcolor: 'rgba(255, 255, 255, 0.7)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  zIndex: 1000
                }}
              >
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Finding restaurants...
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Results Panel */}
          {showResultsPanel && (
            <Paper 
              elevation={3} 
              sx={{ 
                width: isMobile ? '100%' : '40%',
                height: isMobile ? 'auto' : '600px',
                maxHeight: isMobile ? '800px' : '600px',
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">
                  Restaurants within {radius} km
                </Typography>
                <Typography variant="body2">
                  {restaurantsInRadius.length} results found
                </Typography>
              </Box>
              
              {/* Sorting controls */}
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                borderBottom: '1px solid #eee',
                backgroundColor: '#f5f5f5'
              }}>
                <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="sort-select-label">Sort by</InputLabel>
                  <Select
                    labelId="sort-select-label"
                    id="sort-select"
                    value={sortOption}
                    label="Sort by"
                    onChange={handleSortChange}
                    startAdornment={<SortIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    <MenuItem value="distance">Distance</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              {/* Results list */}
              <Box sx={{ 
                px: 2, 
                py: 1,
                flexGrow: 1, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                height: '100%',
                maxHeight: isMobile ? 'calc(100vh - 300px)' : 'calc(600px - 130px)'
              }}>
                {sortedRestaurants.length > 0 ? (
                  sortedRestaurants.map(restaurant => (
                    <Card 
                      key={restaurant.id} 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row', 
                        mb: 2,
                        minHeight: isMobile ? 'auto' : 140,
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        },
                      }}
                    >
                      <CardActionArea component={RouterLink} to={`/restaurant/${restaurant.id}`}>
                        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                          <CardMedia
                            component="img"
                            sx={{ 
                              width: isMobile ? '100%' : 160, 
                              height: isMobile ? 180 : 140,
                              objectFit: 'cover'
                            }}
                            image={restaurant.image_url || '/placeholder-restaurant.jpg'}
                            alt={restaurant.name}
                          />
                          <CardContent sx={{ 
                            flex: '1 0 auto',
                            p: 2,
                            "&:last-child": { pb: 2 },
                            width: isMobile ? '100%' : 'calc(100% - 160px)',
                            minWidth: isMobile ? 'auto' : 200
                          }}>
                            <Typography component="div" variant="h6" sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {restaurant.name}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary" component="div" sx={{ 
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {restaurant.location}
                            </Typography>
                            <StarRating value={restaurant.rating || 0} />
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <LocationOnIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.primary" sx={{ 
                                ml: 0.5,
                                fontWeight: 500
                              }}>
                                {restaurant.distance !== undefined ? `${restaurant.distance.toFixed(2)} km away` : 'Distance unknown'}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Box>
                      </CardActionArea>
                    </Card>
                  ))
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    py: 4
                  }}>
                    <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                      No restaurants found within {radius} km
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                      Try increasing the radius or placing your pin in a different location
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Mobile Only: Back to map button */}
              {isMobile && (
                <Box sx={{ p: 2, borderTop: '1px solid #eee', backgroundColor: '#f5f5f5' }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary" 
                    startIcon={<MapIcon />}
                    onClick={() => setShowResultsPanel(false)}
                  >
                    Return to Map
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </Box>
        
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Showing area within {radius} km of your selected location
            </Typography>
            
            {/* Filter Button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={filterRestaurantsByRadius}
              disabled={!pinPosition || isFiltering}
              fullWidth
            >
              {isFiltering ? 'Searching...' : `Find Restaurants Within ${radius} km`}
            </Button>
          </Box>
        )}
        
        {/* Help Tooltip */}
        <Backdrop
          sx={{ zIndex: theme => theme.zIndex.drawer + 1, color: '#fff' }}
          open={showHelp}
          onClick={toggleHelp}
        >
          <Zoom in={showHelp}>
            <Paper sx={{ maxWidth: 500, p: 3, m: 2 }}>
              <Typography variant="h5" gutterBottom>How to Use the Map</Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>1. Place a Pin</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Click the "Place Pin" button and then click anywhere on the map to set your location.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>2. Adjust the Radius</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Use the slider below the map to set how far to search for restaurants (1-10km).
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>3. Find Restaurants</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Click "Find Restaurants" to see all restaurants within your chosen radius.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>4. View Results</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Results will appear in a panel with the closest restaurants first. Click any restaurant card to see details.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>5. Reset & Start Over</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Click the "Reset" button to remove your pin and start a new search.
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', fontStyle: 'italic' }}>
                Your pin location is saved between visits, so you can always come back to where you left off.
              </Typography>
              
              <Button variant="contained" sx={{ mt: 2, width: '100%' }} onClick={toggleHelp}>
                Got it!
              </Button>
            </Paper>
          </Zoom>
        </Backdrop>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </>
  );
};

export default MapPage; 