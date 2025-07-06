import { Ionicons } from '@expo/vector-icons'; // Requires npm install @expo/vector-icons
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [subLocations, setSubLocations] = useState([]);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default: Bengaluru
  const [mapError, setMapError] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // Simplified Leaflet HTML
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Leaflet Map</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          try {
            var map = L.map('map').setView([${mapCenter.lat}, ${mapCenter.lng}], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              maxZoom: 19,
            }).addTo(map);

            // Add markers for sub-locations
            var subLocations = ${JSON.stringify(subLocations)};
            subLocations.forEach(function(loc) {
              L.marker([loc.lat, loc.lng])
                .addTo(map)
                .bindPopup(loc.name);
            });

            // Handle map click
            map.on('click', function(e) {
              var lat = e.latlng.lat;
              var lng = e.latlng.lng;
              L.marker([lat, lng]).addTo(map).bindPopup('Selected: ' + lat.toFixed(4) + ', ' + lng.toFixed(4)).openPopup();
              window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
            });

            // Signal map loaded
            window.ReactNativeWebView.postMessage(JSON.stringify({ loaded: true }));
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ error: error.message }));
          }
        </script>
      </body>
    </html>
  `;

  // Handle search input
  const handleSearch = () => {
    if (searchQuery.trim() === '') return;
    const query = searchQuery.trim();
    fetchSubLocations(query);
    setMapCenter({ lat: 12.9716, lng: 77.5946 }); // Mock coordinates
    setMapLoading(true); // Reset loading state
  };

  // Mock function to simulate sub-locations
  const fetchSubLocations = (query) => {
    const mockSubLocations = [
      { id: 1, name: Parking Lot A - ${query}, lat: 12.9716, lng: 77.5946 },
      { id: 2, name: Parking Lot B - ${query}, lat: 12.9718, lng: 77.5948 },
      { id: 3, name: Parking Lot C - ${query}, lat: 12.9714, lng: 77.5944 },
    ];
    setSubLocations(mockSubLocations);
    setSelectedLocation(null);
    setParkingSlots([]);
  };

  // Handle sub-location selection
  const handleSubLocationSelect = (subLocation) => {
    setSelectedLocation(subLocation);
    setMapCenter({ lat: subLocation.lat, lng: subLocation.lng });
    fetchParkingSlots(subLocation);
    setMapLoading(true); // Reset loading state
  };

  // Handle map click or errors
  const handleMapClick = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.error) {
        console.log('Map Error:', data.error);
        setMapError(true);
        setMapLoading(false);
        return;
      }
      if (data.loaded) {
        setMapLoading(false);
        return;
      }
      const newLocation = {
        id: custom-${Date.now()},
        name: Custom Location (${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}),
        lat: data.lat,
        lng: data.lng,
      };
      setSelectedLocation(newLocation);
      fetchParkingSlots(newLocation);
    } catch (error) {
      console.log('WebView Message Error:', error);
      setMapError(true);
      setMapLoading(false);
    }
  };

  // Mock function to simulate parking slots
  const fetchParkingSlots = (subLocation) => {
    const mockSlots = [
      { id: 1, booked: false },
      { id: 2, booked: true, carModel: 'Toyota Corolla', owner: 'john_doe', hours: '2' },
      { id: 3, booked: false },
      { id: 4, booked: true, carModel: 'Honda Civic', owner: 'jane_smith', hours: '4' },
    ];
    setParkingSlots(mockSlots);
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    if (!slot.booked) {
      const updatedSlots = parkingSlots.map(s =>
        s.id === slot.id
          ? { ...s, booked: true, carModel: 'Default Car', owner: 'user', hours: '1' } // Mock details
          : s
      );
      setParkingSlots(updatedSlots);
      alert(Slot ${slot.id} booked!);
    } else {
      alert('This slot is already booked.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.title}>Search Parking Location</Text>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search in Bengaluru..."
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {mapError ? (
          <View style={styles.fallbackContainer}>
            <Image
              source={{ uri: 'https://tile.openstreetmap.org/13/6637/5678.png' }} // Static OSM tile for Bengaluru
              style={styles.fallbackImage}
            />
            <Text style={styles.fallbackText}>Map failed to load. Tap to retry.</Text>
            <TouchableOpacity onPress={() => { setMapError(false); setMapLoading(true); }}>
              <Text style={styles.retryButton}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {mapLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading Map...</Text>
              </View>
            )}
            <WebView
              source={{ html: leafletHtml }}
              style={[styles.mapWebView, mapLoading && { opacity: 0 }]} // Hide WebView until loaded
              onMessage={handleMapClick}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              mixedContentMode="always"
              originWhitelist={['*']}
              setSupportMultipleWindows={false}
              onError={(syntheticEvent) => {
                console.log('WebView Error:', syntheticEvent.nativeEvent);
                setMapError(true);
                setMapLoading(false);
              }}
              onHttpError={(syntheticEvent) => {
                console.log('HTTP Error:', syntheticEvent.nativeEvent);
                setMapError(true);
                setMapLoading(false);
              }}
              onLoadStart={() => setMapLoading(true)}
              onLoadEnd={() => {
                if (!mapError) setMapLoading(false);
              }}
            />
          </>
        )}
      </View>

      {subLocations.length > 0 && (
        <View style={styles.subLocationsContainer}>
          <Text style={styles.subTitle}>Popular Parking Locations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subLocationsScroll}>
            {subLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.subLocationButton,
                  selectedLocation?.id === location.id && styles.subLocationButtonSelected,
                ]}
                onPress={() => handleSubLocationSelect(location)}
              >
                <Text style={styles.subLocationText}>{location.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedLocation && parkingSlots.length > 0 && (
        <View style={styles.slotsContainer}>
          <Text style={styles.subTitle}>Available Parking Slots</Text>
          <ScrollView>
            {parkingSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[styles.slotButton, slot.booked && styles.slotBooked]}
                onPress={() => handleSlotSelect(slot)}
              >
                {slot.booked ? (
                  <View style={styles.slotDetails}>
                    <Ionicons name="car" size={24} color="#fff" />
                    <View style={styles.slotInfo}>
                      <Text style={styles.slotText}>{slot.carModel || 'Unknown Car'}</Text>
                      <Text style={styles.slotSubText}>Owner: {slot.owner || 'Unknown'}</Text>
                      <Text style={styles.slotSubText}>{slot.hours || '1'} hr</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.emptySlot} />
                    <Text style={styles.slotText}>Slot {slot.id}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapContainer: {
    flex: 0.5,
    backgroundColor: '#1e293b',
    marginBottom: 15,
  },
  mapWebView: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  fallbackImage: {
    width: '100%',
    height: '50%',
    resizeMode: 'contain',
  },
  fallbackText: {
    color: '#ffffff',
    fontSize: 16,
    marginVertical: 10,
  },
  retryButton: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subLocationsContainer: {
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 10,
  },
  subLocationsScroll: {
    flexGrow: 0,
  },
  subLocationButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  subLocationButtonSelected: {
    backgroundColor: '#3b82f6',
  },
  subLocationText: {
    color: '#ffffff',
    fontSize: 14,
  },
  slotsContainer: {
    flex: 0.4,
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  slotBooked: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  slotDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotInfo: {
    marginLeft: 10,
  },
  slotText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 10,
  },
  slotSubText: {
    color: '#ffffff',
    fontSize: 12,
  },
  emptySlot: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 4,
  },
});
