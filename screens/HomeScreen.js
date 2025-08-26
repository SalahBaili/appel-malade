// screens/HomeScreen.js
import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { auth, database } from "../firebase";
import { onValue, ref } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import avatarPlaceholder from "../assets/avatar-placeholder.png";

export default function HomeScreen({ navigation }) {
  const [roomsCount, setRoomsCount] = useState(0);
  const [displayName, setDisplayName] = useState("Infirmier");
  const [photoURL, setPhotoURL] = useState("");

  // Compteur de chambres
  useEffect(() => {
    const unsub = onValue(ref(database, "rooms"), (snap) => {
      const data = snap.val() || {};
      setRoomsCount(Object.keys(data).length);
    });
    return () => unsub();
  }, []);

  // Écoute temps réel du profil (nom + photo)
  useEffect(() => {
    let offDb = null;
    const offAuth = onAuthStateChanged(auth, (u) => {
      if (offDb) { offDb(); offDb = null; }

      if (!u) {
        setDisplayName("Infirmier");
        setPhotoURL("");
        return;
      }

      const fallbackName = u.displayName || (u.email ? u.email.split("@")[0] : "Infirmier");
      const userRef = ref(database, `users/${u.uid}`);

      offDb = onValue(userRef, (snap) => {
        const v = snap.val() || {};
        const nameFromDb = [v.firstName, v.lastName].filter(Boolean).join(" ").trim();
        setDisplayName(nameFromDb || fallbackName || "Infirmier");
        setPhotoURL(v.photoURL || u.photoURL || "");
      });
    });

    return () => {
      if (offDb) offDb();
      offAuth();
    };
  }, []);

  const tiles = useMemo(
    () => [
      { key: "addRoom",     title: "Add room",     icon: "bed-outline",              color: ["#ffffff", "#ffffff"], route: "AddRoom" },
      { key: "checkRooms",  title: "Check room",   icon: "home", set: "feather",     color: ["#7953F6", "#A56BFF"], route: "Rooms", isAccent: true, badge: roomsCount },
      { key: "addPatient",  title: "Add patient",  icon: "user-plus", set: "feather",color: ["#ffffff", "#ffffff"], route: "AddPatient" },
      { key: "patientList", title: "Patient list", icon: "clipboard-outline",        color: ["#ffffff", "#ffffff"], route: "PatientList" },
      { key: "calendar",    title: "Calendar",     icon: "calendar-outline",         color: ["#ffffff", "#ffffff"], route: "Calendar" },
{ key: "office",      title: "Office",       icon: "laptop-outline",           color: ["#ffffff", "#ffffff"], route: "Office" },    ],
    [roomsCount]
  );

  const renderTile = ({ item }) => {
    const IconComp = item.set === "feather" ? Feather : Ionicons;

    const content = (
      <LinearGradient colors={item.color} style={[styles.card, item.isAccent && styles.cardAccent]}>
        {typeof item.badge === "number" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
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

  // Optionnel : buster de cache pour forcer l’actualisation de l’image
  const avatarSrc = photoURL ? { uri: `${photoURL}` } : avatarPlaceholder;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>
            Hello, <Text style={{ fontWeight: "800" }}>{displayName}!</Text>
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Profile")} activeOpacity={0.8}>
          <Image source={avatarSrc} style={styles.avatarMini} />
        </TouchableOpacity>
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
  header: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  hello: { fontSize: 22, color: "#111", marginTop: 6 },

  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#eaeaea",
  },

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
  cardAccent: { shadowOpacity: 0.15 },
  cardTitle: { marginTop: 8, fontSize: 14, color: "#444" },

  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    zIndex: 2,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
