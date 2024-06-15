import React, { useState, useRef } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
} from "react-native";
import MapView, { Polygon, Heatmap } from "react-native-maps";
import {
  generateHeatmapPoints,
  initialRegion,
  mapDarkStyle,
  mapStandardStyle,
} from "./utils";
import { allPolygonCoordinates } from "./data";
import { MaterialIcons } from "@expo/vector-icons";
const CHIP_WIDTH = 120;
const SCROLL_PADDING = 20;
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const mapRef = useRef<MapView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState(null);

  const handlePolygonPress = (index: any) => {
    setSelectedPolygonIndex(index);

    // Zoom into the selected polygon
    if (mapRef.current && index !== null) {
      const coordinates = allPolygonCoordinates[index];
      mapRef.current.animateToRegion({
        ...initialRegion,
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude,
        //zoom into the polygon
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });
      // Scroll to the selected polygon chip
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: index * CHIP_WIDTH - SCROLL_PADDING,
            animated: true,
          });
        }
      }, 200);
    }
  };

  const renderPolygons = () =>
    allPolygonCoordinates.map((polygonCoordinates, index) => {
      const heatmapPoints = generateHeatmapPoints(polygonCoordinates);
      return (
        <View key={index}>
          <Polygon
            coordinates={polygonCoordinates}
            strokeColor="#55d"
            strokeWidth={5}
            tappable={true}
            onPress={() => handlePolygonPress(index)}
          />
          <Heatmap points={heatmapPoints} radius={10} opacity={1} />
        </View>
      );
    });

  return (
    <View style={styles.container}>
      <MapView
        onPress={() => {
          setSelectedPolygonIndex(null);
          //zoom out to the initial region and set the scroll to the start

          if (mapRef.current && scrollViewRef.current) {
            mapRef.current.animateToRegion(initialRegion);
            scrollViewRef.current.scrollTo({ x: 0, animated: true });
          }
        }}
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={isDarkMode ? mapDarkStyle : mapStandardStyle}
      >
        {renderPolygons()}
      </MapView>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScrollView}
        contentInset={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 20,
        }}
        contentContainerStyle={{
          paddingRight: Platform.OS === "android" ? 20 : 0,
        }}
      >
        {allPolygonCoordinates.map((_, index) => (
          <TouchableOpacity
            style={[
              styles.chipsItem,
              {
                backgroundColor:
                  //adapt to dark and light mode
                  isDarkMode
                    ? selectedPolygonIndex === index
                      ? "#55d"
                      : "#333"
                    : selectedPolygonIndex === index
                    ? "#55d"
                    : "#fff",
              },
            ]}
            onPress={() => handlePolygonPress(index)}
          >
            <Text
              style={{
                color: isDarkMode
                  ? selectedPolygonIndex === index
                    ? "#fff"
                    : "#55d"
                  : selectedPolygonIndex === index
                  ? "#fff"
                  : "#333",
              }}
            >{`Heatmap ${index + 1}`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.header,
          {
            backgroundColor: isDarkMode ? "#333" : "#55d",
          },
        ]}
        onPress={() => setIsDarkMode((prev) => !prev)}
      >
        <MaterialIcons
          name={isDarkMode ? "wb-sunny" : "brightness-2"}
          size={28}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 50,
    right: 5,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  carousel: {
    height: 50,
    width: "100%",
  },
  flatList: {
    backgroundColor: "red",
  },
  chipsScrollView: {
    position: "absolute",
    bottom: 60,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    width: 80,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  chipsItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    height: 35,
  },
});
