import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import MapView, { Marker } from 'react-native-maps';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Define location type
interface Location {
  name: string;
  booked: number;
  vacant: number;
  inProgress: number;
  lat: number;
  lon: number;
  subLocations: { name: string; booked: number; vacant: number; inProgress: number }[];
}

// Define booking details type
interface BookingDetails {
  hours: string;
  carName: string;
  ownerName: string;
}

const chartData = [
  { name: 'Booked', population: 650, color: '#ff4d4f', legendFontColor: '#fff', legendFontSize: 14 },
  { name: 'Available', population: 350, color: '#52c41a', legendFontColor: '#fff', legendFontSize: 14 },
  { name: 'In Progress', population: 100, color: '#1890ff', legendFontColor: '#fff', legendFontSize: 14 },
];

// Predefined car and owner names
const predefinedCars = [
  { carName: 'Toyota Camry', ownerName: 'John Doe' },
  { carName: 'Honda Civic', ownerName: 'Jane Smith' },
  { carName: 'Ford Mustang', ownerName: 'Mike Johnson' },
  { carName: 'BMW X5', ownerName: 'Sarah Williams' },
  { carName: 'Audi A4', ownerName: 'David Brown' },
  { carName: 'Mercedes C-Class', ownerName: 'Emily Davis' },
  { carName: 'Volkswagen Golf', ownerName: 'Robert Taylor' },
  { carName: 'Hyundai Sonata', ownerName: 'Lisa Anderson' },
  { carName: 'Kia Optima', ownerName: 'James Wilson' },
  { carName: 'Subaru Outback', ownerName: 'Mary Jones' },
  { carName: 'Tesla Model 3', ownerName: 'Chris Evans' },
  { carName: 'Jeep Wrangler', ownerName: 'Anna White' },
  { carName: 'Chevrolet Malibu', ownerName: 'Paul Green' },
  { carName: 'Nissan Altima', ownerName: 'Linda Clark' },
  { carName: 'Mazda CX-5', ownerName: 'Thomas Lee' },
];

// Top 10 places
const top10Places: Location[] = [
  { name: 'Koramangala', booked: 20, vacant: 5, inProgress: 2, lat: 12.9352, lon: 77.6140, subLocations: [] },
  { name: 'Whitefield', booked: 18, vacant: 7, inProgress: 3, lat: 12.9698, lon: 77.7499, subLocations: [] },
  { name: 'Indiranagar', booked: 15, vacant: 10, inProgress: 1, lat: 12.9716, lon: 77.6412, subLocations: [] },
  { name: 'MG Road', booked: 12, vacant: 8, inProgress: 2, lat: 12.9752, lon: 77.6068, subLocations: [] },
  { name: 'Jayanagar', booked: 10, vacant: 5, inProgress: 1, lat: 12.9299, lon: 77.5877, subLocations: [] },
  { name: 'HSR Layout', booked: 14, vacant: 6, inProgress: 2, lat: 12.9127, lon: 77.6397, subLocations: [] },
  { name: 'Electronic City', booked: 16, vacant: 4, inProgress: 3, lat: 12.8481, lon: 77.6433, subLocations: [] },
  { name: 'Bannerghatta Road', booked: 13, vacant: 7, inProgress: 1, lat: 12.8918, lon: 77.5900, subLocations: [] },
  { name: 'Marathahalli', booked: 11, vacant: 9, inProgress: 2, lat: 12.9552, lon: 77.6962, subLocations: [] },
  { name: 'UB City', booked: 9, vacant: 6, inProgress: 1, lat: 12.9724, lon: 77.5953, subLocations: [] },
];

const barChartData = {
  labels: top10Places.map((loc) => loc.name),
  datasets: [
    {
      data: top10Places.map((loc) => loc.booked + loc.vacant + loc.inProgress),
      color: () => '#1890ff',
    },
  ],
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [adminDetails, setAdminDetails] = useState({ email: '', password: '', name: '' });
  const [adminName, setAdminName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({ hours: '1', slotIndex: null, carName: '', ownerName: '' });
  const [bookedSlots, setBookedSlots] = useState<Record<string, BookingDetails>>({});
  const [userAccessCount, setUserAccessCount] = useState(1200);
  const [liveData, setLiveData] = useState<Location[]>(top10Places);

  const [adminDatabase, setAdminDatabase] = useState<{ email: string; password: string; name: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) =>
        prev.map((loc) => ({
          ...loc,
          booked: Math.max(0, loc.booked + Math.floor(Math.random() * 3) - 1),
          vacant: Math.max(0, loc.vacant + Math.floor(Math.random() * 3) - 1),
          inProgress: Math.max(0, loc.inProgress + Math.floor(Math.random() * 2)),
          subLocations: loc.subLocations.map((sub) => ({
            ...sub,
            booked: Math.max(0, sub.booked + Math.floor(Math.random() * 2) - 1),
            vacant: Math.max(0, sub.vacant + Math.floor(Math.random() * 2) - 1),
            inProgress: Math.max(0, sub.inProgress + Math.floor(Math.random() * 2)),
          })),
        }))
      );
      setUserAccessCount((prev) => prev + Math.floor(Math.random() * 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAuth = () => {
    const { email, password, name } = adminDetails;

    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (isSignUp) {
      if (adminDatabase.some((admin) => admin.email === email)) {
        Alert.alert('Error', 'Email already registered.');
        return;
      }
      setAdminDatabase([...adminDatabase, { email, password, name }]);
      setAdminName(name);
      setIsAuthenticated(true);
      Alert.alert('Success', 'Sign Up Successful!');
    } else {
      const admin = adminDatabase.find(
        (admin) => admin.email === email && admin.password === password
      );
      if (!admin) {
        Alert.alert('Error', 'Invalid email or password.');
        return;
      }
      setAdminName(admin.name || email.split('@')[0]);
      setIsAuthenticated(true);
      Alert.alert('Success', 'Sign In Successful!');
    }

    setAdminDetails({ email: '', password: '', name: '' });
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setBookingDetails({ ...bookingDetails, slotIndex: null, carName: '', ownerName: '' });
  };

  const handleSlotClick = (slotIndex: number, column: number) => {
    if (selectedLocation) {
      const totalSlots = (selectedLocation.booked + selectedLocation.vacant + selectedLocation.inProgress) * 2; // Two columns
      const adjustedIndex = slotIndex + (column * (selectedLocation.booked + selectedLocation.vacant + selectedLocation.inProgress));
      if (!bookedSlots[`${selectedLocation.name}-${adjustedIndex}`] && adjustedIndex < totalSlots) {
        setBookingDetails({ ...bookingDetails, slotIndex: adjustedIndex });
        setShowSideMenu(true);
      }
    }
  };

  const handleUpdateBooking = () => {
    if (selectedLocation && bookingDetails.slotIndex !== null) {
      if (!bookingDetails.hours || !bookingDetails.carName || !bookingDetails.ownerName) {
        Alert.alert('Error', 'Please fill in all fields (hours, car name, and owner name).');
        return;
      }
      setBookedSlots({
        ...bookedSlots,
        [`${selectedLocation.name}-${bookingDetails.slotIndex}`]: {
          hours: bookingDetails.hours,
          carName: bookingDetails.carName,
          ownerName: bookingDetails.ownerName,
        },
      });
      Alert.alert('Success', `Slot updated for ${bookingDetails.hours} hours!`);
      setShowSideMenu(false);
      setBookingDetails({ hours: '1', slotIndex: null, carName: '', ownerName: '' });
    }
  };

  const toggleHeader = () => {
    setIsHeaderMinimized(!isHeaderMinimized);
  };

  if (!isAuthenticated) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c' }}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.authContainer}>
            <Text style={styles.authTitle}>{isSignUp ? 'Admin Sign Up' : 'Admin Sign In'}</Text>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#ccc"
                value={adminDetails.name}
                onChangeText={(text) => setAdminDetails({ ...adminDetails, name: text })}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ccc"
              value={adminDetails.email}
              onChangeText={(text) => setAdminDetails({ ...adminDetails, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ccc"
              secureTextEntry
              value={adminDetails.password}
              onChangeText={(text) => setAdminDetails({ ...adminDetails, password: text })}
            />
            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.authButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.toggleAuthText}>
                {isSignUp ? 'Already have an account? Sign In' : 'No account? Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c' }}
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
              <View style={styles.headerProfile}>
                <Ionicons name="person-circle" size={40} color="#fff" />
                <Text style={styles.headerTitle}>Welcome, {adminName}!</Text>
              </View>
              <Text style={styles.headerText}>
                Manage parking operations, monitor live updates, and optimize slot allocations.
              </Text>
            </>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>🚗 Admin Parking Dashboard</Text>

          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Users</Text>
              <Text style={styles.cardValue}>{userAccessCount}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Full Locations</Text>
              <Text style={styles.cardValue}>
                {liveData.filter((loc) => loc.vacant === 0).length}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>In Progress</Text>
              <Text style={styles.cardValue}>
                {liveData.reduce((sum, loc) => sum + loc.inProgress, 0)}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>📊 Booking Status</Text>
          <PieChart
            data={chartData}
            width={screenWidth - 30}
            height={220}
            chartConfig={chartConfig}
            accessor={'population'}
            backgroundColor={'transparent'}
            paddingLeft={'15'}
            style={styles.pieChart}
            hasLegend={true}
            center={[0, 0]}
            absolute
          />

          <Text style={styles.sectionTitle}>📍 Top 10 Places</Text>
          <View style={styles.gridContainer}>
            {top10Places.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={styles.gridItem}
                onPress={() => handleLocationClick(location)}
              >
                <Text style={styles.gridText}>
                  {location.name} (B: {location.booked}, V: {location.vacant})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>📍 Bar Chart - Top 10 Places</Text>
          <BarChart
            data={barChartData}
            width={screenWidth - 30}
            height={220}
            chartConfig={chartConfig}
            style={styles.barChart}
            verticalLabelRotation={30}
            yAxisLabel=""
            yAxisSuffix=" slots"
            fromZero
          />

          {selectedLocation && (
            <>
              <Text style={styles.sectionTitle}>{selectedLocation.name} - Parking Slots</Text>
              <View style={styles.parkingContainer}>
                <View style={styles.parkingGrid}>
                  {Array.from({ length: 2 }).map((_, column) => (
                    <View key={column} style={styles.column}>
                      {Array.from({ length: selectedLocation.booked + selectedLocation.vacant + selectedLocation.inProgress }).map((_, i) => {
                        const adjustedIndex = i + (column * (selectedLocation.booked + selectedLocation.vacant + selectedLocation.inProgress));
                        const isBooked = adjustedIndex < selectedLocation.booked * 2 || !!bookedSlots[`${selectedLocation.name}-${adjustedIndex}`];
                        const isInProgress = adjustedIndex >= selectedLocation.booked * 2 && adjustedIndex < (selectedLocation.booked + selectedLocation.inProgress) * 2;
                        const slotBooking = bookedSlots[`${selectedLocation.name}-${adjustedIndex}`] || (adjustedIndex < selectedLocation.booked * 2 ? predefinedCars[adjustedIndex % predefinedCars.length] : null);
                        return (
                          <TouchableOpacity
                            key={adjustedIndex}
                            style={styles.parkingSlot}
                            onPress={() => handleSlotClick(i, column)}
                            disabled={isBooked}
                          >
                            {isBooked ? (
                              <View>
                                <Ionicons name="car" size={30} color="#fff" />
                                {slotBooking && (
                                  <View style={styles.bookingInfo}>
                                    <Text style={styles.bookingText}>Car: {slotBooking.carName}</Text>
                                    <Text style={styles.bookingText}>Owner: {slotBooking.ownerName}</Text>
                                    <Text style={styles.bookingText}>Hours: {slotBooking.hours || '2'}</Text>
                                  </View>
                                )}
                              </View>
                            ) : isInProgress ? (
                              <Text style={styles.parkingSlotText}>In Progress</Text>
                            ) : (
                              <View style={styles.emptySlot} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>🗺️ Map View</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 12.9716,
              longitude: 77.5946,
              latitudeDelta: 0.09,
              longitudeDelta: 0.04,
            }}
          >
            {liveData.map((location, idx) => (
              <Marker
                key={idx}
                coordinate={{ latitude: location.lat, longitude: location.lon }}
                title={`${location.name} (B: ${location.booked}, V: {location.vacant})`}
                pinColor="#ff4d4f"
              />
            ))}
          </MapView>
        </ScrollView>

        <Modal visible={showSideMenu} transparent animationType="slide">
          <View style={styles.sideMenuContainer}>
            <View style={styles.sideMenu}>
              <Text style={styles.sideMenuTitle}>Update Parking Slot</Text>
              <Text style={styles.label}>Select Booking Hours</Text>
              <Picker
                selectedValue={bookingDetails.hours}
                onValueChange={(itemValue) => setBookingDetails({ ...bookingDetails, hours: itemValue })}
                style={styles.picker}
              >
                {[...Array(12).keys()].map((h) => (
                  <Picker.Item key={h + 1} label={`${h + 1} Hour${h > 0 ? 's' : ''}`} value={`${h + 1}`} />
                ))}
              </Picker>
              <TextInput
                style={styles.input}
                placeholder="Car Name"
                placeholderTextColor="#ccc"
                value={bookingDetails.carName}
                onChangeText={(text) => setBookingDetails({ ...bookingDetails, carName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Owner Name"
                placeholderTextColor="#ccc"
                value={bookingDetails.ownerName}
                onChangeText={(text) => setBookingDetails({ ...bookingDetails, ownerName: text })}
              />
              <TouchableOpacity style={styles.payButton} onPress={handleUpdateBooking}>
                <Text style={styles.payButtonText}>Update Slot</Text>
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

const chartConfig = {
  backgroundColor: '#1e3c72',
  backgroundGradientFrom: '#1e3c72',
  backgroundGradientTo: '#1e3c72',
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: () => '#ffffff',
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: 'rgba(255, 255, 255, 0.2)',
  },
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(44, 62, 80, 0.95)',
    margin: 20,
    borderRadius: 20,
  },
  authTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
    width: '80%',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleAuthText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  scroll: { paddingBottom: 150 },
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
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
    marginLeft: 10,
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
  },
  subSectionTitle: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 10,
    marginLeft: 25,
    fontWeight: '500',
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
  barChart: {
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
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
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  subLocationContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  subLocationText: {
    color: '#fff',
    fontSize: 14,
    marginVertical: 5,
    marginLeft: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(76, 102, 159, 0.9)',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  gridText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  parkingContainer: {
    backgroundColor: 'rgba(44, 62, 80, 0.95)',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  parkingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  parkingSlot: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  emptySlot: {
    width: 0,
    height: 0,
  },
  bookingInfo: {
    alignItems: 'center',
    marginTop: 5,
  },
  bookingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  parkingSlotText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
