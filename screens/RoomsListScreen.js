import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { database } from "../firebase";
import { onValue, ref, query, orderByChild, remove } from "firebase/database";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function RoomsListScreen({ navigation }) {
  const [rooms, setRooms] = useState(null);
  const swipeableRefs = useRef(new Map());

  useEffect(() => {
    const q = query(ref(database, "rooms"), orderByChild("name"));
    const unsub = onValue(q, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setRooms(list);
    });
    return () => unsub();
  }, []);

  const confirmDelete = (room) => {
    Alert.alert(
      "Supprimer la chambre",
      `Voulez-vous supprimer « ${room.name} » ?`,
      [
        { text: "Annuler", style: "cancel", onPress: () => closeSwipe(room.id) },
        { text: "Supprimer", style: "destructive", onPress: () => handleDelete(room) },
      ]
    );
  };

  const handleDelete = async (room) => {
    try {
      await remove(ref(database, `rooms/${room.id}`));
    } catch (e) {
      Alert.alert("Erreur", "Suppression impossible. Réessaie.");
    } finally {
      closeSwipe(room.id);
    }
  };

  const closeSwipe = (id) => {
    const refItem = swipeableRefs.current.get(id);
    if (refItem) refItem.close();
  };

  const renderRightActions = (progress, dragX, room) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.6],
      extrapolate: "clamp",
    });
    return (
      <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(room)}>
        <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.deleteText}>Supprimer</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <Swipeable
      ref={(r) => swipeableRefs.current.set(item.id, r)}
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("EditRoom", { roomId: item.id })}
        style={styles.card}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="bed-outline" size={22} color="#6C63FF" style={{ marginRight: 8 }} />
          <Text style={styles.name}>{item.name || "—"}</Text>
        </View>
        <Text style={styles.meta}>{item.floor ? `Étage/Aile : ${item.floor}` : "—"}</Text>
      </TouchableOpacity>
    </Swipeable>
  );

  if (rooms === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Chargement des chambres…</Text>
      </View>
    );
  }

  if (!rooms.length) {
    return (
      <View style={styles.center}>
        <Text>Aucune chambre pour le moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chambres</Text>
      <FlatList
        data={rooms}
        keyExtractor={(it) => it.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#666", marginTop: 4 },
  deleteBtn: {
    width: 96,
    backgroundColor: "#E74C3C",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteText: { color: "#fff", fontWeight: "700", marginTop: 6 },
});
