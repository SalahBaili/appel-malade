// ForgotPasswordScreen.js (robuste + cleanup timer)
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const isEmail = (s) => /\S+@\S+\.\S+/.test(s);

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // on garde l'id du setInterval pour pouvoir le stopper (unmount ou fin du compte)
  const cooldownRef = useRef(null);

  const isEmailValid = useMemo(() => isEmail(email.trim()), [email]);

  // Nettoyage à la sortie de l'écran
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = (sec = 30) => {
    // évite plusieurs intervals simultanés
    if (cooldownRef.current) clearInterval(cooldownRef.current);

    setCooldown(sec);
    cooldownRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handlePasswordReset = async () => {
    setSuccessMsg("");
    setErrorMsg("");

    const e = email.trim().toLowerCase();
    if (!e) {
      setErrorMsg("Veuillez entrer votre adresse e-mail.");
      return;
    }
    if (!isEmail(e)) {
      setErrorMsg("Format d’e-mail invalide.");
      return;
    }
    if (cooldown > 0) return;

    try {
      setSending(true);
      await sendPasswordResetEmail(auth, e /* , actionCodeSettings optionnel */);
      setSuccessMsg(
        "Un lien de réinitialisation a été envoyé. Vérifiez votre boîte de réception et les spams."
      );
      startCooldown(30);
    } catch (error) {
      // Mapping détaillé des erreurs courantes
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMsg(
            "Aucun compte n’est associé à cet e-mail. Vérifiez l’adresse ou créez un compte."
          );
          break;
        case "auth/invalid-email":
          setErrorMsg("Adresse e-mail invalide.");
          break;
        case "auth/too-many-requests":
          setErrorMsg("Trop de tentatives. Réessayez dans quelques minutes.");
          break;
        case "auth/invalid-continue-uri":
        case "auth/unauthorized-continue-uri":
        case "auth/missing-continue-uri":
        case "auth/missing-ios-bundle-id":
        case "auth/missing-android-pkg-name":
          setErrorMsg(
            "Lien de redirection mal configuré (Domaines autorisés / continueUrl)."
          );
          break;
        default:
          setErrorMsg("Échec de l’envoi de l’e-mail. Réessayez.");
      }
      console.log("ForgotPassword error.code:", error.code);
    } finally {
      setSending(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://img.freepik.com/free-vector/gradient-purple-background_23-2148978633.jpg",
      }}
      style={styles.bg}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email and we’ll send you a reset link.
        </Text>

        {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        {!!successMsg && <Text style={styles.success}>{successMsg}</Text>}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            // on efface les messages pendant la saisie
            if (errorMsg) setErrorMsg("");
            if (successMsg) setSuccessMsg("");
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[
            styles.resetBtn,
            (sending || cooldown > 0 || !isEmailValid) && { opacity: 0.6 },
          ]}
          onPress={handlePasswordReset}
          disabled={sending || cooldown > 0 || !isEmailValid}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.resetText}>
              {cooldown > 0 ? `RESEND IN ${cooldown}s` : "SEND RESET LINK"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.backText}>
            ← Back to <Text style={{ color: "#6C63FF", fontWeight: "bold" }}>Login</Text>
          </Text>
        </TouchableOpacity>

        {/* Astuces visibles pour l'utilisateur */}
        <View style={{ marginTop: 12 }}>
          <Text style={styles.hint}>• Vérifie aussi le dossier spam/indésirables</Text>
          <Text style={styles.hint}>
            • L’e-mail doit correspondre à un compte existant (Authentication → Utilisateurs)
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: "center" },
  container: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    margin: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 16 },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resetBtn: {
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 14,
  },
  resetText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  backText: { textAlign: "center", fontSize: 14, color: "#333" },
  error: { color: "#e74c3c", textAlign: "center", marginBottom: 8 },
  success: { color: "#2ecc71", textAlign: "center", marginBottom: 8 },
  hint: { fontSize: 12, color: "#666", textAlign: "center" },
});
