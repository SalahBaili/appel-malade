import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "./firebase";
import { ref, set } from "firebase/database";

const validateEmail = (s) => /\S+@\S+\.\S+/.test(s);

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "Le nom est obligatoire";
    if (!lastName.trim())  e.lastName  = "Le prénom est obligatoire";
    if (!email.trim())     e.email     = "L’e-mail est obligatoire";
    else if (!validateEmail(email.trim())) e.email = "Format d’e-mail invalide";
    if (!password)         e.password  = "Le mot de passe est obligatoire";
    else if (password.length < 6) e.password = "Minimum 6 caractères";
    if (!confirmPassword)  e.confirmPassword = "Confirmez le mot de passe";
    else if (password && confirmPassword && password !== confirmPassword) e.confirmPassword = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const userId = userCredential.user.uid;
      await set(ref(database, "users/" + userId), {
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.trim(),
      });
      // Navigation automatique se fera via onAuthStateChanged(App.js)
    } catch (error) {
      // Gestion lisible des erreurs Firebase
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev)=>({ ...prev, email: "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser une autre adresse." }));
      } else if (error.code === "auth/invalid-email") {
        setErrors((prev)=>({ ...prev, email: "Adresse e-mail invalide." }));
      } else if (error.code === "auth/weak-password") {
        setErrors((prev)=>({ ...prev, password: "Mot de passe trop faible (min 6 caractères)." }));
      } else {
        setErrors((prev)=>({ ...prev, global: "Une erreur est survenue. Réessayez." }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ImageBackground source={{ uri: "https://img.freepik.com/free-vector/gradient-purple-background_23-2148978633.jpg" }} style={styles.bg}>
      <View style={styles.container}>
        <Text style={styles.title}>Create your account</Text>
        {!!errors.global && <Text style={styles.errorGlobal}>{errors.global}</Text>}

        <TextInput
          placeholder="First Name"
          style={[styles.input, errors.firstName && styles.inputError]}
          value={firstName}
          onChangeText={(t)=>{ setFirstName(t); if(errors.firstName) setErrors({...errors, firstName: undefined}); }}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

        <TextInput
          placeholder="Last Name"
          style={[styles.input, errors.lastName && styles.inputError]}
          value={lastName}
          onChangeText={(t)=>{ setLastName(t); if(errors.lastName) setErrors({...errors, lastName: undefined}); }}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

        <TextInput
          placeholder="Email"
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={(t)=>{ setEmail(t); if(errors.email) setErrors({...errors, email: undefined}); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          placeholder="Password"
          style={[styles.input, errors.password && styles.inputError]}
          secureTextEntry
          value={password}
          onChangeText={(t)=>{ setPassword(t); if(errors.password) setErrors({...errors, password: undefined}); }}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TextInput
          placeholder="Confirm Password"
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          secureTextEntry
          value={confirmPassword}
          onChangeText={(t)=>{ setConfirmPassword(t); if(errors.confirmPassword) setErrors({...errors, confirmPassword: undefined}); }}
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

        <TouchableOpacity style={[styles.signupBtn, submitting && { opacity: 0.6 }]} onPress={handleSignup} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupText}>SIGN UP</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>Already a member? <Text style={{ color: "#6C63FF", fontWeight: "bold" }}>Login</Text></Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: "center" },
  container: { padding: 20, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 20, margin: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 12 },
  input: { backgroundColor: "#f5f5f5", padding: 12, borderRadius: 10, marginBottom: 6, fontSize: 16, borderWidth: 1, borderColor: "#ddd" },
  inputError: { borderColor: "#e74c3c", backgroundColor: "#fff" },
  errorText: { color: "#e74c3c", marginBottom: 6, fontSize: 13 },
  errorGlobal: { color: "#e74c3c", textAlign: "center", marginBottom: 12 },
  signupBtn: { backgroundColor: "#6C63FF", padding: 15, borderRadius: 25, alignItems: "center", marginTop: 6, marginBottom: 16 },
  signupText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loginText: { textAlign: "center", fontSize: 14, marginTop: 6, color: "#333" },
});
