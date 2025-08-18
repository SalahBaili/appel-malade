// ForgotPasswordScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez entrer votre adresse e-mail.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Succès",
        "Un lien de réinitialisation a été envoyé à votre adresse e-mail."
      );
      navigation.navigate("Login"); // Retour à Login après envoi
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://img.freepik.com/free-vector/gradient-purple-background_23-2148978633.jpg" }}
      style={styles.bg}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email and we’ll send you a reset link.
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.resetBtn} onPress={handlePasswordReset}>
          <Text style={styles.resetText}>SEND RESET LINK</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.backText}>
            ← Back to <Text style={{ color: "#6C63FF", fontWeight: "bold" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: "center" },
  container: { padding: 20, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 20, margin: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 20 },
  input: { backgroundColor: "#f5f5f5", padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  resetBtn: { backgroundColor: "#6C63FF", padding: 15, borderRadius: 25, alignItems: "center", marginBottom: 20 },
  resetText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  backText: { textAlign: "center", fontSize: 14, marginTop: 10, color: "#333" },
});
