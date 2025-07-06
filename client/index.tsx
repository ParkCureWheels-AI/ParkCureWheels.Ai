import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import MapView, { Marker } from 'react-native-maps';
import Svg, { Rect, Image as SvgImage, Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const chartData = [
  { name: 'Booked', population: 650, color: '#ff4d4f', legendFontColor: '#fff', legendFontSize: 14 },
  { name: 'Available', population: 350, color: '#52c41a', legendFontColor: '#fff', legendFontSize: 14 },
];

const topLocations = [
  {
    name: 'Koramangala',
    booked: 20,
    vacant: 5,
    lat: 12.9352,
    lon: 77.6140,
    subLocations: [
      { name: '5th Block', booked: 8, vacant: 2, lat: 12.9360, lon: 77.6135 },
      { name: '7th Block', booked: 7, vacant: 2, lat: 12.9345, lon: 77.6150 },
      { name: 'HSR Layout', booked: 5, vacant: 1, lat: 12.9116, lon: 77.6387 },
    ],
  },
  {
    name: 'Whitefield',
    booked: 18,
    vacant: 7,
    lat: 12.9698,
    lon: 77.7499,
    subLocations: [
      { name: 'ITPL', booked: 6, vacant: 3, lat: 12.9855, lon: 77.7354 },
      { name: 'Brookefield', booked: 7, vacant: 2, lat: 12.9662, lon: 77.7169 },
      { name: 'Kadugodi', booked: 5, vacant: 2, lat: 12.9941, lon: 77.7598 },
    ],
  },
  {
    name: 'Indiranagar',
    booked: 15,
    vacant: 10,
    lat: 12.9716,
    lon: 77.6412,
    subLocations: [
      { name: '100 Feet Road', booked: 5, vacant: 4, lat: 12.9807, lon: 77.6408 },
      { name: '12th Main', booked: 6, vacant: 3, lat: 12.9733, lon: 77.6450 },
      { name: 'CMH Road', booked: 4, vacant: 3, lat: 12.9749, lon: 77.6372 },
    ],
  },
  {
    name: 'Jayanagar',
    booked: 25,
    vacant: 2,
    lat: 12.9250,
    lon: 77.5938,
    subLocations: [
      { name: '4th Block', booked: 9, vacant: 1, lat: 12.9248, lon: 77.5920 },
      { name: '9th Block', booked: 8, vacant: 0, lat: 12.9210, lon: 77.5930 },
      { name: 'South End Circle', booked: 8, vacant: 1, lat: 12.9315, lon: 77.5870 },
    ],
  },
  {
    name: 'Malleshwaram',
    booked: 10,
    vacant: 15,
    lat: 13.0057,
    lon: 77.5696,
    subLocations: [
      { name: '8th Cross', booked: 4, vacant: 5, lat: 13.0030, lon: 77.5700 },
      { name: 'Sampige Road', booked: 3, vacant: 5, lat: 13.0065, lon: 77.5730 },
      { name: 'Malleswaram Circle', booked: 3, vacant: 5, lat: 13.0080, lon: 77.5680 },
    ],
  },
];

const parkingSlots = [
  { id: 0, x: 20, y: 20, width: 120, height: 50 },
  { id: 1, x: 20, y: 80, width: 120, height: 50 },
  { id: 2, x: 20, y: 140, width: 120, height: 50 },
  { id: 3, x: 20, y: 200, width: 120, height: 50 },
  { id: 4, x: 20, y: 260, width: 120, height: 50 },
  { id: 5, x: 160, y: 20, width: 120, height: 50 },
  { id: 6, x: 160, y: 80, width: 120, height: 50 },
  { id: 7, x: 160, y: 140, width: 120, height: 50 },
  { id: 8, x: 160, y: 200, width: 120, height: 50 },
  { id: 9, x: 160, y: 260, width: 120, height: 50 },
];

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSubLocation, setSelectedSubLocation] = useState(null);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const [carDetails, setCarDetails] = useState({ model: '', number: '' });
  const [hours, setHours] = useState('1');
  const [bookedSlots, setBookedSlots] = useState({});
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [showSlotPreview, setShowSlotPreview] = useState(false);
  const [previewSlot, setPreviewSlot] = useState(null);

  const chartConfig = {
    backgroundColor: '#1e3c72',
    backgroundGradientFrom: '#1e3c72',
    backgroundGradientTo: '#1e3c72',
    color: (opacity = 1) => rgba(255, 255, 255, ${opacity}),
    labelColor: () => '#ffffff',
  };

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const foundUser = users.find((u) => u.email === email && u.password === password);
    if (foundUser) {
      setUser({ email });
      setEmail('');
      setPassword('');
    } else {
      Alert.alert('Error', 'Invalid email or password.');
    }
  };

  const handleSignUp = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (users.find((u) => u.email === email)) {
      Alert.alert('Error', 'Email already registered.');
      return;
    }
    setUsers([...users, { email, password }]);
    setUser({ email });
    setEmail('');
    setPassword('');
    setIsSignUp(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setSelectedLocation(null);
    setSelectedSubLocation(null);
    setSelectedSlotIndex(null);
    setBookedSlots({});
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setSelectedSubLocation(null);
    setSelectedSlotIndex(null);
  };

  const handleSubLocationClick = (subLocation) => {
    setSelectedSubLocation(subLocation);
    setSelectedSlotIndex(null);
  };

  const handleSlotClick = (slotIndex) => {
    if (selectedSubLocation && !bookedSlots[${selectedSubLocation.name}-${slotIndex}]?.isBooked &&
        slotIndex < (selectedSubLocation.booked + selectedSubLocation.vacant)) {
      setPreviewSlot(slotIndex);
      setShowSlotPreview(true);
    }
  };

  const handleBookParking = () => {
    if (!carDetails.model || !carDetails.number) {
      Alert.alert('Error', 'Please fill in all car details.');
      return;
    }
    if (selectedSubLocation && selectedSlotIndex !== null) {
      setBookedSlots({
        ...bookedSlots,
        [${selectedSubLocation.name}-${selectedSlotIndex}]: {
          isBooked: true,
          carModel: carDetails.model,
          owner: user.email.split('@')[0],
          hours: hours,
        },
      });
      Alert.alert('Success', 'Booked Successfully!');
      setShowSideMenu(false);
      setCarDetails({ model: '', number: '' });
      setHours('1');
      setSelectedSlotIndex(null);
    }
  };

  const toggleHeader = () => {
    setIsHeaderMinimized(!isHeaderMinimized);
  };

  if (!user) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' }}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.authContainer}>
            <Text style={styles.authTitle}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.authButton}
              onPress={isSignUp ? handleSignUp : handleSignIn}
            >
              <Text style={styles.authButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleAuthButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.toggleAuthText}>
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={[styles.header, isHeaderMinimized ? styles.headerMinimized : {}]}>
          <TouchableOpacity onPress={toggleHeader} style={styles.headerToggle}>
            <Ionicons name={isHeaderMinimized ? 'chevron-down' : 'chevron-up'} size={24} color="#fff" />
            <Text style={styles.headerToggleText}>{isHeaderMinimized ? 'Expand' : 'Minimize'}</Text>
          </TouchableOpacity>
          {!isHeaderMinimized && (
            <>
              <View style={styles.headerUserContainer}>
                <Text style={styles.headerTitle}>Welcome, {user.email.split('@')[0]}!</Text>
                <View style={styles.headerIcons}>
                  <TouchableOpacity onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={30} color="#fff" style={styles.headerIcon} />
                  </TouchableOpacity>
                  <Ionicons name="person-circle" size={30} color="#fff" style={styles.headerIcon} />
                </View>
              </View>
              <Text style={styles.headerText}>
                Book parking spots in Bengaluru effortlessly. Secure, fast, and tailored for you.
              </Text>
            </>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>🚘 Smart Parking Hub</Text>

          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Parkings</Text>
              <Text style={styles.cardValue}>1,000</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>This Month</Text>
              <Text style={styles.cardValue}>750</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Available</Text>
              <Text style={styles.cardValue}>250</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>📊 Revenue Insights</Text>
          <PieChart
            data={chartData}
            width={screenWidth - 30}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.pieChart}
          />

          <Text style={styles.sectionTitle}>📍 Top Bengaluru Locations</Text>
          {topLocations.map((location, index) => (
            <TouchableOpacity
              key={index}
              style={styles.locationButton}
              onPress={() => handleLocationClick(location)}
            >
              <Ionicons name="location" size={20} color="#fff" />
              <Text style={styles.locationText}>{location.name}</Text>
            </TouchableOpacity>
          ))}

          {selectedLocation && (
            <>
              <Text style={styles.sectionTitle}>{selectedLocation.name} - Popular Areas</Text>
              {selectedLocation.subLocations.map((subLocation, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.subLocationButton}
                  onPress={() => handleSubLocationClick(subLocation)}
                >
                  <Ionicons name="pin" size={18} color="#fff" />
                  <Text style={styles.locationText}>{subLocation.name}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {selectedSubLocation && (
            <>
              <Text style={styles.sectionTitle}>{selectedSubLocation.name} - Parking Lot</Text>
              <View style={styles.parkingContainer}>
                <View style={styles.parkingImageContainer}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1506521781261-d73483c1a7c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' }}
                    style={styles.parkingImage}
                    resizeMode="contain"
                  />
                  <Svg style={styles.parkingSvg} width={screenWidth - 40} height={340}>
                    {parkingSlots.slice(0, selectedSubLocation.booked + selectedSubLocation.vacant).map((slot) => {
                      const slotKey = ${selectedSubLocation.name}-${slot.id};
                      const isBooked = slot.id < selectedSubLocation.booked || bookedSlots[slotKey]?.isBooked;
                      return (
                        <React.Fragment key={slot.id}>
                          <Rect
                            x={slot.x}
                            y={slot.y}
                            width={slot.width}
                            height={slot.height}
                            fill={isBooked ? 'transparent' : 'rgba(82, 196, 26, 0.5)'}
                            stroke={previewSlot === slot.id ? '#ffd700' : '#fff'}
                            strokeWidth={previewSlot === slot.id ? '3' : '1'}
                            onPress={() => handleSlotClick(slot.id)}
                          />
                          {isBooked && (
                            <>
                              <SvgImage
                                x={slot.x + 10}
                                y={slot.y + 5}
                                width={slot.width - 80}
                                height={slot.height - 10}
                                href={{ uri: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' }}
                                preserveAspectRatio="xMidYMid slice"
                                onPress={() => handleSlotClick(slot.id)}
                              />
                              <SvgText
                                x={slot.x + slot.width - 70}
                                y={slot.y + 15}
                                fill="#fff"
                                fontSize="8"
                                fontWeight="bold"
                                textAnchor="start"
                              >
                                {bookedSlots[slotKey]?.carModel || 'Unknown Car'}
                              </SvgText>
                              <SvgText
                                x={slot.x + slot.width - 70}
                                y={slot.y + 30}
                                fill="#fff"
                                fontSize="8"
                                fontWeight="bold"
                                textAnchor="start"
                              >
                                {bookedSlots[slotKey]?.owner || 'Unknown Owner'}
                              </SvgText>
                              <SvgText
                                x={slot.x + slot.width - 70}
                                y={slot.y + 45}
                                fill="#fff"
                                fontSize="8"
                                fontWeight="bold"
                                textAnchor="start"
                              >
                                {bookedSlots[slotKey]?.hours || '1'} hr
                              </SvgText>
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </Svg>
                </View>
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>🗺 Map View</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 12.9716,
              longitude: 77.5946,
              latitudeDelta: 0.09,
              longitudeDelta: 0.04,
            }}
            region={
              selectedSubLocation
                ? {
                    latitude: selectedSubLocation.lat,
                    longitude: selectedSubLocation.lon,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.01,
                  }
                : selectedLocation
                ? {
                    latitude: selectedLocation.lat,
                    longitude: selectedLocation.lon,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.01,
                  }
                : {
                    latitude: 12.9716,
                    longitude: 77.5946,
                    latitudeDelta: 0.09,
                    longitudeDelta: 0.04,
                  }
            }
          >
            {selectedSubLocation
              ? [
                  <Marker
                    key={selectedSubLocation.name}
                    coordinate={{ latitude: selectedSubLocation.lat, longitude: selectedSubLocation.lon }}
                    title={selectedSubLocation.name}
                    pinColor="#ff4d4f"
                  />,
                ]
              : selectedLocation
              ? selectedLocation.subLocations.map((subLocation, idx) => (
                  <Marker
                    key={idx}
                    coordinate={{ latitude: subLocation.lat, longitude: subLocation.lon }}
                    title={subLocation.name}
                    pinColor="#ff4d4f"
                  />
                ))
              : topLocations.map((location, idx) => (
                  <Marker
                    key={idx}
                    coordinate={{ latitude: location.lat, longitude: location.lon }}
                    title={location.name}
                    pinColor="#ff4d4f"
                  />
                ))}
          </MapView>

          <Modal visible={showSlotPreview} transparent animationType="fade">
            <View style={styles.slotPreviewContainer}>
              <View style={styles.slotPreview}>
                <Text style={styles.slotPreviewTitle}>Slot #{previewSlot + 1}</Text>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' }}
                  style={styles.slotPreviewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.bookSlotButton}
                  onPress={() => {
                    setSelectedSlotIndex(previewSlot);
                    setShowSlotPreview(false);
                    setShowSideMenu(true);
                  }}
                >
                  <Text style={styles.bookSlotButtonText}>Book This Slot</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closePreviewButton}
                  onPress={() => setShowSlotPreview(false)}
                >
                  <Text style={styles.closePreviewButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>

        <Modal visible={showSideMenu} transparent animationType="slide">
          <View style={styles.sideMenuContainer}>
            <View style={styles.sideMenu}>
              <Text style={styles.sideMenuTitle}>Book Parking Slot</Text>
              <TextInput
                style={styles.input}
                placeholder="Car Model"
                placeholderTextColor="#ccc"
                value={carDetails.model}
                onChangeText={(text) => setCarDetails({ ...carDetails, model: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Car Number"
                placeholderTextColor="#ccc"
                value={carDetails.number}
                onChangeText={(text) => setCarDetails({ ...carDetails, number: text })}
              />
              <Text style={styles.label}>Select Hours</Text>
              <Picker
                selectedValue={hours}
                onValueChange={(itemValue) => setHours(itemValue)}
                style={styles.picker}
              >
                {[...Array(12).keys()].map((h) => (
                  <Picker.Item key={h + 1} label={${h + 1} Hour${h > 0 ? 's' : ''}} value={${h + 1}} />
                ))}
              </Picker>
              <TouchableOpacity
                style={styles.payButton}
                onPress={handleBookParking}
              >
                <Text style={styles.payButtonText}>Pay Fees</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowSideMenu(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(44, 62, 80, 0.95)',
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },
  authTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
    borderWidth: 2,
    borderColor: '#fff',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleAuthButton: {
    marginTop: 10,
  },
  toggleAuthText: {
    color: '#aaa',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  scroll: {
    paddingBottom: 150,
  },
  header: {
    padding: 30,
    backgroundColor: 'rgba(246, 211, 101, 0.9)',
    borderBottomRightRadius: 80,
    borderBottomLeftRadius: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  headerMinimized: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerToggleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  headerUserContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    opacity: 0.9,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
    marginVertical: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    marginVertical: 15,
    marginLeft: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginVertical: 15,
  },
  card: {
    backgroundColor: 'rgba(107, 114, 128, 0.9)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  cardValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 5,
  },
  pieChart: {
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: 'rgba(30, 60, 114, 0.8)',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 102, 159, 0.9)',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  subLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 102, 159, 0.7)',
    padding: 12,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  parkingContainer: {
    backgroundColor: 'rgba(44, 62, 80, 0.95)',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  parkingImageContainer: {
    position: 'relative',
    width: screenWidth - 40,
    height: 340,
  },
  parkingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  parkingSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  map: {
    height: 250,
    width: '95%',
    alignSelf: 'center',
    borderRadius: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  slotPreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotPreview: {
    backgroundColor: '#2c3e50',
    padding: 20,
    borderRadius: 15,
    width: screenWidth * 0.9,
    alignItems: 'center',
  },
  slotPreviewTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  slotPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  bookSlotButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  bookSlotButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closePreviewButton: {
    marginTop: 15,
  },
  closePreviewButtonText: {
    color: '#aaa',
  },
  sideMenuContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  sideMenu: {
    backgroundColor: 'rgba(44, 62, 80, 0.95)',
    width: screenWidth * 0.8,
    height: screenHeight,
    padding: 20,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },
  sideMenuTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: 16,
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  picker: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderRadius: 10,
    marginVertical: 10,
  },
  payButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: 'rgba(76, 102, 159, 0.9)',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export const navigationOptions = {
  headerShown: false,
  tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
};
