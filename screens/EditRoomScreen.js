import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { database } from "../firebase";
import { ref, get, update, remove } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";

export default function EditRoomScreen({ route, navigation }) {
  const { roomId } = route.params;
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const snap = await get(ref(database, `rooms/${roomId}`));
        if (!snap.exists()) {
          Alert.alert("Info", "Cette chambre n'existe plus.");
          return navigation.goBack();
        }
        const v = snap.val();
        setName(v.name || "");
        setFloor(v.floor || "");
      } catch (e) {
        Alert.alert("Erreur", "Impossible de charger la chambre.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  const save = async () => {
    if (!name.trim()) return Alert.alert("Validation", "Le nom est obligatoire.");
    try {
      await update(ref(database, `rooms/${roomId}`), {
        name: name.trim(),
        floor: floor.trim() || null,
      });
      Alert.alert("Succès", "Chambre mise à jour.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erreur", "Mise à jour impossible.");
    }
  };

  const del = () => {
    Alert.alert("Supprimer", "Supprimer cette chambre ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await remove(ref(database, `rooms/${roomId}`));
            navigation.goBack();
          } catch (e) {
            Alert.alert("Erreur", "Suppression impossible.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier la chambre</Text>
        <View style={{ width: 26 }} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nom de la chambre"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Étage / Aile (optionnel)"
        value={floor}
        onChangeText={setFloor}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>Enregistrer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={del}>
        <Text style={styles.deleteText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16, justifyContent: "space-between" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: "#fafafa" },
  saveBtn: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 14, alignItems: "center", marginTop: 6 },
  saveText: { color: "#fff", fontWeight: "700" },
  deleteBtn: { backgroundColor: "#E74C3C", padding: 14, borderRadius: 14, alignItems: "center", marginTop: 12 },
  deleteText: { color: "#fff", fontWeight: "700" },
});
