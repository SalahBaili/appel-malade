// HomeScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";

const tiles = [
  { key: "addRoom", title: "Add room", icon: "bed-outline", color: ["#ffffff", "#ffffff"], route: "AddRoom" },
  { key: "living", title: "Living room", icon: "sofa", color: ["#7953F6", "#A56BFF"], route: null, isAccent: true },
  { key: "addPatient", title: "Add patient", icon: "user-plus", set: "feather", color: ["#ffffff", "#ffffff"], route: "AddPatient" },
  { key: "patientList", title: "Patient list", icon: "clipboard-outline", color: ["#ffffff", "#ffffff"], route: "PatientList" },
  { key: "calendar", title: "Calendar", icon: "calendar-outline", color: ["#ffffff", "#ffffff"], route: "Calendar" },
  { key: "office", title: "Office", icon: "laptop-outline", color: ["#ffffff", "#ffffff"], route: null },
];

export default function HomeScreen({ navigation }) {
  const renderTile = ({ item }) => {
    const IconComp = item.set === "feather" ? Feather : Ionicons;
    const content = (
      <LinearGradient colors={item.color} style={[styles.card, item.isAccent && styles.cardAccent]}>
        <IconComp name={item.icon} size={28} color={item.isAccent ? "#fff" : "#6C63FF"} />
        <Text style={[styles.cardTitle, item.isAccent && { color: "#fff" }]} numberOfLines={1}>
          {item.title}
        </Text>
      </LinearGradient>
    );

    if (!item.route) return <View style={{ flex: 1, margin: 8 }}>{content}</View>;

    return (
      <TouchableOpacity
        style={{ flex: 1, margin: 8 }}
        activeOpacity={0.85}
        onPress={() => navigation.navigate(item.route)}
      >
        {content}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hello}>Hello, <Text style={{ fontWeight: "800" }}>John!</Text></Text>
        <Ionicons name="menu" size={24} color="#333" />
      </View>

      <FlatList
        data={tiles}
        numColumns={2}
        renderItem={renderTile}
        keyExtractor={(it) => it.key}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F5FB", paddingTop: 40 },
  header: { paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  hello: { fontSize: 26, color: "#111" },
  card: {
    height: 120,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardAccent: {
    shadowOpacity: 0.15,
  },
  cardTitle: { marginTop: 8, fontSize: 14, color: "#444" },
});
