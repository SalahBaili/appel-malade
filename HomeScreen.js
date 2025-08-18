import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Vibration } from "react-native";
import { signOut } from "firebase/auth";
import { auth, database } from "./firebase";
import { ref, push } from "firebase/database";

export default function HomeScreen({ navigation }) {
  const [alertMessage, setAlertMessage] = useState("Aucune alerte pour le moment");

  const saveAlert = (patient) => {
    const alertsRef = ref(database, "alerts");
    push(alertsRef, {
      patient,
      timestamp: Date.now(),
      status: "non traité",
    });
  };

  const handleAlert = (patient) => {
    const message = `📢 Appel malade : ${patient}`;
    setAlertMessage(message);
    Vibration.vibrate(1000);
    saveAlert(patient);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accueil Infirmier</Text>
      <Text style={styles.alert}>{alertMessage}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Patient 101" onPress={() => handleAlert("Patient 101")} />
        <Button title="Patient 102" onPress={() => handleAlert("Patient 102")} />
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Voir Historique" onPress={() => navigation.navigate("Historique")} />
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  alert: { fontSize: 22, color: "red", textAlign: "center", marginBottom: 20 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "80%", marginTop: 20 },
});
