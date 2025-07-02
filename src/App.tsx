import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Box, Paper, CircularProgress, Alert, Autocomplete, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, InputAdornment, IconButton } from '@mui/material';
import { GoogleMap, Autocomplete as GoogleAutocomplete } from '@react-google-maps/api';
import axios from 'axios';
import PlacesAutocomplete, { Suggestion } from 'react-places-autocomplete';
import logo from './logo.png';
import ClearIcon from '@mui/icons-material/Clear';
import PrivacyPolicy from './PrivacyPolicy';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyAbavZzIUQyr5Pm_8YsPYw_nusONSQPHms';

const LOCATIONS = [
  { label: 'Exact Location', travelMinutes: 0 },
  { label: 'Custom', travelMinutes: 0 },
];

const AIRPORTS = {
  'JFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy International' },
  'EWR': { lat: 40.6895, lng: -74.1745, name: 'Newark Liberty International' },
  'SWF': { lat: 41.5041, lng: -74.1048, name: 'Stewart International' },
  'LGA': { lat: 40.7769, lng: -73.8740, name: 'LaGuardia' },
  'HPN': { lat: 41.0669, lng: -73.7076, name: 'Westchester County (White Plains)' },
  'CLT': { lat: 35.2140, lng: -80.9431, name: 'Charlotte Douglas International' },
  'GSO': { lat: 36.1053, lng: -79.9373, name: 'Piedmont Triad International (Greensboro)' },
  'SFO': { lat: 37.6213, lng: -122.3790, name: 'San Francisco International' },
  'MCO': { lat: 28.4312, lng: -81.3081, name: 'Orlando International' },
  'ATL': { lat: 33.6407, lng: -84.4277, name: 'Hartsfield–Jackson Atlanta International' },
  'ORD': { lat: 41.9742, lng: -87.9073, name: 'Chicago O\'Hare' },
  'DTW': { lat: 42.2162, lng: -83.3554, name: 'Detroit Metropolitan Wayne County' },
  'ALB': { lat: 42.7483, lng: -73.8027, name: 'Albany International' },
  // Alaska and Hawaii
  'ANC': { lat: 61.1743, lng: -149.9985, name: 'Ted Stevens Anchorage International, Alaska' },
  'FAI': { lat: 64.8151, lng: -147.8563, name: 'Fairbanks International, Alaska' },
  'HNL': { lat: 21.3245, lng: -157.9251, name: 'Daniel K. Inouye International (Honolulu), Hawaii' },
  'OGG': { lat: 20.8987, lng: -156.4305, name: 'Kahului Airport (Maui), Hawaii' },
  // International airports
  'FCO': { lat: 41.8003, lng: 12.2389, name: 'Rome Fiumicino (Leonardo da Vinci), Italy' },
  'DUB': { lat: 53.4273, lng: -6.2436, name: 'Dublin Airport, Ireland' },
  'LHR': { lat: 51.4700, lng: -0.4543, name: 'London Heathrow, England' },
  'MAD': { lat: 40.4983, lng: -3.5676, name: 'Madrid Barajas, Spain' },
  'FRA': { lat: 50.0379, lng: 8.5622, name: 'Frankfurt am Main, Germany' },
  'BKK': { lat: 13.6900, lng: 100.7501, name: 'Bangkok Suvarnabhumi, Thailand' },
  // Add more airports as needed
  'PVD': { lat: 41.7267, lng: -71.4336, name: 'T. F. Green Airport (Providence, RI)' },
  'BDL': { lat: 41.9389, lng: -72.6832, name: 'Bradley International (Hartford, CT)' },
  'HVN': { lat: 41.2637, lng: -72.8868, name: 'Tweed New Haven Airport (New Haven, CT)' },
  'FLL': { lat: 26.0726, lng: -80.1527, name: 'Fort Lauderdale-Hollywood International (Ft Lauderdale, FL)' },
  'PIE': { lat: 27.9102, lng: -82.6874, name: 'St. Pete–Clearwater International (Saint Pete, FL)' },
  'BCT': { lat: 26.3785, lng: -80.1077, name: 'Boca Raton Airport (Boca Raton, FL)' },
  'SAN': { lat: 32.7338, lng: -117.1933, name: 'San Diego International (San Diego, CA)' },
};

// List of international airport abbreviations
const INTERNATIONAL_AIRPORTS = ['FCO', 'DUB', 'LHR', 'MAD', 'FRA', 'BKK'];

function App() {
  const [location, setLocation] = useState(LOCATIONS[0].label);
  const [customTravel, setCustomTravel] = useState('');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState('JFK');
  const [exactAddress, setExactAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [airportError, setAirportError] = useState<string | null>(null);
  const [departureError, setDepartureError] = useState<string | null>(null);
  const [travelType, setTravelType] = useState<'domestic' | 'international'>('domestic');

  useEffect(() => {
    let autocompleteInstance: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;
    if (location === 'Exact Location' && window.google && addressInputRef.current) {
      autocompleteInstance = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
      });
      listener = autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance?.getPlace();
        if (place && place.formatted_address) {
          setExactAddress(place.formatted_address);
        }
      });
    }
    // Cleanup
    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Update travelType when selectedAirport changes
  useEffect(() => {
    if (INTERNATIONAL_AIRPORTS.includes(selectedAirport)) {
      setTravelType('international');
    } else {
      setTravelType('domestic');
    }
  }, [selectedAirport]);

  const getTravelMinutes = async () => {
    if (location === 'Exact Location' && exactAddress) {
      setIsLoading(true);
      setAddressError(null);
      try {
        // 1. Geocode the address using the Maps JavaScript API
        const geocoder = new window.google.maps.Geocoder();
        const geocodeResult = await new Promise<google.maps.LatLng>((resolve, reject) => {
          geocoder.geocode({ address: exactAddress }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0].geometry.location);
            } else {
              reject('Address not found. Please enter a valid address.');
            }
          });
        });

        const origin = geocodeResult;
        const destination = AIRPORTS[selectedAirport as keyof typeof AIRPORTS];
        const destLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);

        // 2. Use DistanceMatrixService
        const service = new window.google.maps.DistanceMatrixService();
        const distanceResult = await new Promise<google.maps.DistanceMatrixResponseElement>((resolve, reject) => {
          service.getDistanceMatrix(
            {
              origins: [origin],
              destinations: [destLatLng],
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (response, status) => {
              if (
                status === 'OK' &&
                response &&
                response.rows &&
                response.rows[0] &&
                response.rows[0].elements &&
                response.rows[0].elements[0] &&
                response.rows[0].elements[0].status === 'OK'
              ) {
                resolve(response.rows[0].elements[0]);
              } else {
                reject('Could not calculate driving time. Please check the address.');
              }
            }
          );
        });

        const duration = distanceResult.duration.value;
        return Math.ceil(duration / 60); // Convert seconds to minutes
      } catch (error) {
        setAddressError(typeof error === 'string' ? error : 'Error calculating travel time. Please try again.');
        return 0;
      } finally {
        setIsLoading(false);
      }
    } else if (location === 'Custom') {
      setAddressError(null);
      const min = parseInt(customTravel, 10);
      return isNaN(min) ? 0 : min;
    }
    setAddressError(null);
    return LOCATIONS.find(l => l.label === location)?.travelMinutes || 0;
  };

  const handleCalculate = async () => {
    let hasError = false;
    setAddressError(null);
    setAirportError(null);
    setDepartureError(null);
    if (location === 'Exact Location' && !exactAddress) {
      setAddressError('Please enter your exact address.');
      hasError = true;
    }
    if (!selectedAirport) {
      setAirportError('Please select an airport.');
      hasError = true;
    }
    if (!departure) {
      setDepartureError('Please select your flight departure time.');
      hasError = true;
    }
    if (hasError) return;

    const depDate = new Date(departure);
    if (isNaN(depDate.getTime())) {
      setDepartureError('Please select a valid flight departure time.');
      return;
    }

    const travelMinutes = await getTravelMinutes();
    // 2 hours before departure + travel time
    const totalMinutes = 120 + travelMinutes;
    const arrDate = new Date(depDate.getTime() - totalMinutes * 60000);
    setArrival(arrDate.toLocaleString());
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Container maxWidth="sm" sx={{ mt: 6 }}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <img src={logo} alt="Airport Travel Time Logo" style={{ display: 'block', margin: '0 auto 24px auto', maxWidth: 240, width: '100%' }} />
                <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    select
                    label="Your Location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    fullWidth
                  >
                    {LOCATIONS.map(loc => (
                      <MenuItem key={loc.label} value={loc.label}>{loc.label}</MenuItem>
                    ))}
                  </TextField>

                  {location === 'Exact Location' && (
                    <Box>
                      <PlacesAutocomplete
                        value={exactAddress}
                        onChange={setExactAddress}
                        onSelect={setExactAddress}
                        debounce={300}
                        highlightFirstSuggestion
                      >
                        {/* @ts-ignore: react-places-autocomplete does not provide types for render props */}
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                          <div style={{ position: 'relative' }}>
                            <TextField
                              {...getInputProps({
                                label: 'Enter your exact address',
                                placeholder: 'Enter your exact address',
                              })}
                              error={!!addressError}
                              helperText={addressError}
                              fullWidth
                              variant="outlined"
                              InputProps={{
                                style: {
                                  background: '#fff',
                                },
                                endAdornment: exactAddress ? (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="clear address"
                                      onClick={() => setExactAddress('')}
                                      edge="end"
                                    >
                                      <ClearIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ) : null,
                              }}
                            />
                            <div style={{ position: 'absolute', zIndex: 1000, background: '#fff', width: '100%' }}>
                              {loading && <div style={{ padding: 8 }}>Loading...</div>}
                              {suggestions.map((suggestion: any) => {
                                const style = {
                                  backgroundColor: suggestion.active ? '#e3f2fd' : '#fff',
                                  padding: '8px 14px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #eee',
                                };
                                return (
                                  <div {...getSuggestionItemProps(suggestion, { style })} key={suggestion.placeId}>
                                    {suggestion.description}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </PlacesAutocomplete>
                    </Box>
                  )}

                  {location === 'Custom' && (
                    <TextField
                      label="Travel Time to Airport (minutes)"
                      type="number"
                      value={customTravel}
                      onChange={e => setCustomTravel(e.target.value)}
                      fullWidth
                    />
                  )}

                  {location !== 'Custom' && (
                    <Autocomplete
                      options={Object.entries(AIRPORTS).map(([abbr, data]) => ({ abbr, ...data }))}
                      getOptionLabel={option => `${option.abbr} - ${option.name}`}
                      filterOptions={(options, { inputValue }) =>
                        options.filter(option =>
                          option.abbr.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.name.toLowerCase().includes(inputValue.toLowerCase())
                        )
                      }
                      value={Object.entries(AIRPORTS).map(([abbr, data]) => ({ abbr, ...data })).find(opt => opt.abbr === selectedAirport) || null}
                      onChange={(_, newValue) => setSelectedAirport(newValue ? newValue.abbr : '')}
                      renderInput={params => (
                        <TextField {...params} label="Airport" variant="outlined" fullWidth error={!!airportError} helperText={airportError} />
                      )}
                      isOptionEqualToValue={(option, value) => option.abbr === value.abbr}
                    />
                  )}

                  <TextField
                    label="Flight Departure Time"
                    type="datetime-local"
                    value={departure}
                    onChange={e => setDeparture(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    error={!!departureError}
                    helperText={departureError}
                  />

                  {/* Move Travel Type radio buttons below Flight Departure Time */}
                  {location !== 'Custom' && (
                    <Box>
                      <FormControl component="fieldset">
                        <FormLabel component="legend">Travel Type</FormLabel>
                        <RadioGroup
                          row
                          value={travelType}
                          onChange={e => setTravelType(e.target.value as 'domestic' | 'international')}
                          name="travel-type-group"
                        >
                          <FormControlLabel value="domestic" control={<Radio />} label="Domestic" />
                          <FormControlLabel value="international" control={<Radio />} label="International" />
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  )}

                  <Button 
                    variant="contained" 
                    onClick={handleCalculate} 
                    size="large"
                    disabled={
                      isLoading ||
                      (location === 'Exact Location' && !exactAddress) ||
                      !!addressError ||
                      !selectedAirport ||
                      !departure
                    }
                    sx={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#222' } }}
                  >
                    {isLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Calculate'}
                  </Button>
                </Box>

                {arrival && (
                  <Box mt={4}>
                    <Typography variant="h6">Recommended Departure Time:</Typography>
                    <Typography variant="body1" color="primary">{arrival}</Typography>
                    <Typography variant="h6" sx={{ mt: 2 }}>Recommended Arrival Time:</Typography>
                    <Typography variant="body1" color="secondary">
                      {(() => {
                        if (!departure) return '';
                        const depDate = new Date(departure);
                        if (isNaN(depDate.getTime())) return '';
                        const hoursBefore = travelType === 'international' ? 3 : 2;
                        const airportArrival = new Date(depDate.getTime() - hoursBefore * 60 * 60000);
                        return airportArrival.toLocaleString();
                      })()}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Link to="/privacy-policy" style={{ color: '#000', textDecoration: 'underline', fontSize: 14 }}>
                    Privacy Policy
                  </Link>
                </Box>
              </Paper>
            </Container>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;
