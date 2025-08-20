import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function SettingsScreen() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      alert("Erreur de déconnexion");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Paramètres</Text>

      <TouchableOpacity style={styles.button} onPress={() => alert("Changer le mot de passe")}>
        <Text style={styles.buttonText}>Changer le mot de passe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => alert("Notifications")}>
        <Text style={styles.buttonText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#E74C3C" }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  button: { backgroundColor: "#6C63FF", padding: 15, borderRadius: 10, marginBottom: 15 },
  buttonText: { color: "#fff", fontSize: 16, textAlign: "center" },
});
