// screens/SettingsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase";

export default function SettingsScreen() {
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const resetModal = () => {
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setSaving(false);
    setShowPwdModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      Alert.alert("Erreur", "Erreur de déconnexion");
    }
  };

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Session expirée", "Reconnectez-vous.");

    if (!currentPwd.trim() || !newPwd.trim() || !confirmPwd.trim()) {
      return Alert.alert("Validation", "Remplissez tous les champs.");
    }
    if (newPwd.length < 6) {
      return Alert.alert("Validation", "Nouveau mot de passe : 6 caractères minimum.");
    }
    if (newPwd !== confirmPwd) {
      return Alert.alert("Validation", "Les mots de passe ne correspondent pas.");
    }

    try {
      setSaving(true);

      // Étape 1: ré-authentification
      const cred = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, cred);

      // Étape 2: mise à jour du mot de passe
      await updatePassword(user, newPwd);

      Alert.alert("Succès", "Mot de passe mis à jour.");
      resetModal();
    } catch (e) {
      let msg = "Veuillez vérifier le mot de passe actuel. Réessayez.";
      if (e.code === "auth/wrong-password") msg = "Mot de passe actuel incorrect.";
      else if (e.code === "auth/weak-password") msg = "Mot de passe trop faible (≥ 6 caractères).";
      else if (e.code === "auth/too-many-requests") msg = "Trop de tentatives, réessayez plus tard.";
      else if (e.code === "auth/user-mismatch") msg = "Utilisateur différent, reconnectez-vous.";
      else if (e.code === "auth/user-not-found") msg = "Utilisateur introuvable, reconnectez-vous.";
      else if (e.code === "auth/network-request-failed") msg = "Problème réseau.";
      Alert.alert("Erreur", msg);
    } finally {
      setSaving(false);
    }
  };

  // Plan B : e-mail de réinitialisation
  const handleSendResetEmail = async () => {
    const user = auth.currentUser;
    if (!user?.email) return Alert.alert("Info", "Aucune adresse e-mail sur ce compte.");
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("Envoyé", "Vérifiez votre boîte de réception (et les spams).");
    } catch (e) {
      let msg = "Échec de l’envoi de l’e-mail.";
      if (e.code === "auth/invalid-email") msg = "Adresse e-mail invalide.";
      else if (e.code === "auth/user-not-found") msg = "Utilisateur introuvable.";
      Alert.alert("Erreur", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Paramètres</Text>

      <TouchableOpacity style={styles.button} onPress={() => setShowPwdModal(true)}>
        <Text style={styles.buttonText}>Changer le mot de passe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={handleSendResetEmail}>
        <Text style={styles.buttonText}>Envoyer un e-mail de réinitialisation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#E74C3C" }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>

      {/* Modal changement mot de passe */}
      <Modal visible={showPwdModal} transparent animationType="fade" onRequestClose={resetModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>

            <TextInput
              style={styles.input}
              placeholder="Mot de passe actuel"
              secureTextEntry
              value={currentPwd}
              onChangeText={setCurrentPwd}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              secureTextEntry
              value={newPwd}
              onChangeText={setNewPwd}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le nouveau mot de passe"
              secureTextEntry
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: "#999" }]} onPress={resetModal} disabled={saving}>
                <Text style={styles.smallBtnText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: "#6C63FF" }, saving && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.smallBtnText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },

  button: { backgroundColor: "#6C63FF", padding: 15, borderRadius: 10, marginBottom: 15 },
  buttonSecondary: { backgroundColor: "#4A90E2", padding: 15, borderRadius: 10, marginBottom: 15 },
  buttonText: { color: "#fff", fontSize: 16, textAlign: "center" },

  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center",
  },
  modalCard: {
    width: "88%", backgroundColor: "#fff", borderRadius: 14, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, backgroundColor: "#fafafa",
    fontSize: 16, marginBottom: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  smallBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, minWidth: 120, alignItems: "center" },
  smallBtnText: { color: "#fff", fontWeight: "600" },
});
