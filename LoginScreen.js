import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const validateEmail = (s) => /\S+@\S+\.\S+/.test(s);

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false); // 👈 toggle
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "L’e-mail est obligatoire";
    else if (!validateEmail(email.trim())) e.email = "Format d’e-mail invalide";
    if (!password) e.password = "Le mot de passe est obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation gérée par onAuthStateChanged dans App.js
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        global: "Identifiants invalides ou compte introuvable.",
      }));
    } finally {
      setSubmitting(false);
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
        <Text style={styles.title}>FIND ANYTHING{"\n"}GET EVERYTHING</Text>

        {!!errors.global && <Text style={styles.errorGlobal}>{errors.global}</Text>}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* Password + toggle */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            style={[styles.input, { flex: 1, marginBottom: 0 }, errors.password && styles.inputError]}
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd((v) => !v)}>
            <Text style={styles.eyeText}>{showPwd ? "Masquer" : "Afficher"}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, submitting && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>LOGIN</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={{ color: "#6C63FF", fontWeight: "bold" }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
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
  title: { fontSize: 22, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 20 },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputError: { borderColor: "#e74c3c", backgroundColor: "#fff" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  eyeBtn: {
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 10,
    justifyContent: "center",
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  eyeText: { color: "#6C63FF", fontWeight: "600" },
  errorText: { color: "#e74c3c", marginBottom: 6, fontSize: 13 },
  errorGlobal: { color: "#e74c3c", textAlign: "center", marginBottom: 12 },
  forgot: { color: "#6C63FF", textAlign: "right", marginVertical: 8 },
  loginBtn: {
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  signupText: { textAlign: "center", fontSize: 14, marginTop: 6, color: "#333" },
});
