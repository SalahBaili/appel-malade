// screens/ProfileScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { getAuth } from "firebase/auth";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    setUser(auth.currentUser); // récupérer l'utilisateur connecté
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <Text>Aucun utilisateur connecté</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profil</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Nom affiché :</Text>
        <Text style={styles.value}>{user.displayName || "Inconnu"}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Email :</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => alert("Fonction modifier profil à ajouter")}
      >
        <Text style={styles.buttonText}>Modifier Profil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  infoBox: {
    marginBottom: 15,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  label: {
    fontSize: 16,
    color: "#777",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
