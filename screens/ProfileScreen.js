// screens/ProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { auth, database } from "../firebase";
import { onAuthStateChanged, updateProfile, updateEmail } from "firebase/auth";
import { ref, onValue, update as dbUpdate } from "firebase/database";

export default function ProfileScreen() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Champs éditables
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");

  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);

  // Récupère l’utilisateur + écoute /users/{uid}
  useEffect(() => {
    const offAuth = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u || null);
      if (!u) {
        setLoading(false);
        return;
      }
      const userRef = ref(database, `users/${u.uid}`);
      const offDb = onValue(userRef, (snap) => {
        const v = snap.val() || {};
        setFirstName(v.firstName || "");
        setLastName(v.lastName || "");
        // email: depuis DB si dispo, sinon depuis Auth
        setEmail(v.email || u.email || "");
        setLoading(false);
      });
      // cleanup pour l'écoute DB
      return () => offDb();
    });
    // cleanup pour l’écoute Auth
    return () => offAuth();
  }, []);

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    (firebaseUser && firebaseUser.displayName) ||
    (firebaseUser && firebaseUser.email ? firebaseUser.email.split("@")[0] : "") ||
    "Inconnu";

  const validateEmail = (s) => /\S+@\S+\.\S+/.test(s);

  const handleSave = async () => {
    if (!firebaseUser) return;
    // validations simples
    if (!firstName.trim() && !lastName.trim()) {
      return Alert.alert("Validation", "Renseigne au moins le prénom ou le nom.");
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      return Alert.alert("Validation", "Adresse e-mail invalide.");
    }

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

    try {
      setSaving(true);

      // 1) Mettre à jour l'Auth (displayName)
      if (fullName && fullName !== (firebaseUser.displayName || "")) {
        await updateProfile(firebaseUser, { displayName: fullName });
      }

      // 2) Mettre à jour l'email Auth si changé
      if (email.trim() !== (firebaseUser.email || "")) {
        await updateEmail(firebaseUser, email.trim());
      }

      // 3) Mettre à jour dans la Realtime DB
      await dbUpdate(ref(database, `users/${firebaseUser.uid}`), {
        firstName: firstName.trim() || null,
        lastName:  lastName.trim()  || null,
        email:     email.trim(),
      });

      Alert.alert("Succès", "Profil mis à jour.");
      setEditing(false);
    } catch (e) {
      // gestion cas sensible (email) : requires recent login
      if (e.code === "auth/requires-recent-login") {
        Alert.alert(
          "Action sécurisée",
          "Pour changer l’e-mail, reconnecte-toi puis réessaie."
        );
      } else if (e.code === "auth/invalid-email") {
        Alert.alert("Erreur", "Adresse e-mail invalide.");
      } else if (e.code === "auth/email-already-in-use") {
        Alert.alert("Erreur", "Cet e-mail est déjà utilisé.");
      } else {
        Alert.alert("Erreur", "Mise à jour impossible. Réessaie.");
      }
      console.log("Profile update error:", e.code, e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Chargement du profil…</Text>
      </View>
    );
  }

  if (!firebaseUser) {
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

      {!editing ? (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Nom affiché :</Text>
            <Text style={styles.value}>{displayName}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Email :</Text>
            <Text style={styles.value}>{email}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>Modifier Profil</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.editRow}>
            <Text style={styles.editLabel}>Prénom</Text>
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.editRow}>
            <Text style={styles.editLabel}>Nom</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.editRow}>
            <Text style={styles.editLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemple.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.button, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#999" }]}
              onPress={() => setEditing(false)}
              disabled={saving}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "flex-start" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center", marginTop: 40 },
  infoBox: { marginBottom: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  label: { fontSize: 14, color: "#777" },
  value: { fontSize: 18, fontWeight: "600", color: "#222", marginTop: 2 },

  editRow: { marginBottom: 12 },
  editLabel: { fontSize: 14, color: "#777", marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12,
    backgroundColor: "#fafafa", fontSize: 16,
  },

  button: { backgroundColor: "#6C63FF", padding: 15, borderRadius: 10, minWidth: 150, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "600" },
});
