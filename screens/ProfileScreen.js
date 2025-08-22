// screens/ProfileScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Animated,
  Easing,
  Linking,
  Platform,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import Constants from "expo-constants";

import avatarPlaceholder from "../assets/avatar-placeholder.png";

import { auth, database } from "../firebase";
import { onAuthStateChanged, updateProfile, updateEmail } from "firebase/auth";
import { ref as dbRef, onValue, update as dbUpdate } from "firebase/database";

// ================== Cloudinary (remplace si besoin) ==================
const CLOUD_NAME = "dvrnqoz5s";
const UPLOAD_PRESET = "malade";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
// ====================================================================

export default function ProfileScreen() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [photoURL, setPhotoURL]   = useState("");

  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const offAuth = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u || null);
      if (!u) {
        setLoading(false);
        return;
      }
      const userRef = dbRef(database, `users/${u.uid}`);
      const offDb = onValue(userRef, (snap) => {
        const v = snap.val() || {};
        setFirstName(v.firstName || "");
        setLastName(v.lastName || "");
        setEmail(v.email || u.email || "");
        setPhotoURL(v.photoURL || u.photoURL || "");
        setLoading(false);
      });
      return () => offDb();
    });
    return () => offAuth();
  }, []);

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    (firebaseUser?.displayName) ||
    (firebaseUser?.email ? firebaseUser.email.split("@")[0] : "") ||
    "Inconnu";

  const validateEmail = (s) => /\S+@\S+\.\S+/.test(s);

  const handleSave = async () => {
    if (!firebaseUser) return;
    if (!firstName.trim() && !lastName.trim()) {
      return Alert.alert("Validation", "Renseigne au moins le prénom ou le nom.");
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      return Alert.alert("Validation", "Adresse e-mail invalide.");
    }

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

    try {
      setSaving(true);

      if (fullName && fullName !== (firebaseUser.displayName || "")) {
        await updateProfile(firebaseUser, { displayName: fullName });
      }

      if (email.trim() !== (firebaseUser.email || "")) {
        await updateEmail(firebaseUser, email.trim());
      }

      await dbUpdate(dbRef(database, `users/${firebaseUser.uid}`), {
        firstName: firstName.trim() || null,
        lastName:  lastName.trim()  || null,
        email:     email.trim(),
        photoURL:  photoURL || null,
      });

      Alert.alert("Succès", "Profil mis à jour.");
      setEditing(false);
    } catch (e) {
      if (e.code === "auth/requires-recent-login") {
        Alert.alert("Action sécurisée", "Pour changer l’e-mail, reconnecte-toi puis réessaie.");
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

  // -------- Helpers image picker (compat toutes versions) --------
  const getImagePickerOptions = () => {
    const base = { allowsEditing: true, aspect: [1, 1], quality: 0.9, base64: true };
    if (ImagePicker && ImagePicker.MediaType) {
      // SDK récents: tableau de MediaType
      return { ...base, mediaTypes: [ImagePicker.MediaType.Images] };
    }
    // SDK plus anciens: enum historique
    return { ...base, mediaTypes: ImagePicker.MediaTypeOptions.Images };
  };

  // Upload d'une Data URI vers Cloudinary
  const uploadDataUriToCloudinary = async (dataUri) => {
    const fd = new FormData();
    fd.append("file", dataUri);
    fd.append("upload_preset", UPLOAD_PRESET);
    fd.append("folder", `users/${firebaseUser.uid}`);

    const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) {
      console.log("Cloudinary error payload:", json);
      throw new Error(json.error?.message || "Upload Cloudinary échoué");
    }
    return json.secure_url;
  };
  // ---------------------------------------------------------------

  // Ouvre la galerie
  const openImageLibrary = async () => {
    const isExpoGoAndroid = Platform.OS === "android" && Constants.appOwnership === "expo";

    try {
      // Fallback Expo Go Android → DocumentPicker (plus fiable)
      if (isExpoGoAndroid) {
        const res = await DocumentPicker.getDocumentAsync({
          type: ["image/*"],
          multiple: false,
          copyToCacheDirectory: true,
        });
        if (res.canceled) return;
        const file = res.assets?.[0];
        if (!file?.uri) return;

        const b64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const dataUri = `data:image/*;base64,${b64}`;

        setUploading(true);
        const url = await uploadDataUriToCloudinary(dataUri);
        await updateProfile(firebaseUser, { photoURL: url });
        await dbUpdate(dbRef(database, `users/${firebaseUser.uid}`), { photoURL: url });
        setPhotoURL(url);
        Alert.alert("Succès", "Photo mise à jour.");
        return;
      }

      // iOS / dev build Android : permission
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted" && perm.status !== "limited") {
        Alert.alert(
          "Permission requise",
          "Autorise l’accès à la galerie pour choisir une photo.",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Ouvrir Réglages", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      // Si iOS "sélection de photos" → permettre d’en ajouter
      if (Platform.OS === "ios" && perm.status === "limited") {
        try { await ImagePicker.presentLimitedLibraryPickerAsync(); } catch {}
      }

      const result = await ImagePicker.launchImageLibraryAsync(getImagePickerOptions());
      if (result.canceled) return;

      const asset = result.assets[0];
      const mime = asset.mimeType || "image/jpeg";
      const dataUri = asset.base64
        ? `data:${mime};base64,${asset.base64}`
        : `data:image/jpeg;base64,${
            await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 })
          }`;

      setUploading(true);
      const url = await uploadDataUriToCloudinary(dataUri);
      await updateProfile(firebaseUser, { photoURL: url });
      await dbUpdate(dbRef(database, `users/${firebaseUser.uid}`), { photoURL: url });
      setPhotoURL(url);
      Alert.alert("Succès", "Photo mise à jour.");
    } catch (e) {
      console.log("openImageLibrary error:", e);
      Alert.alert("Erreur", "Upload impossible. Vérifie le preset unsigned Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  // Caméra
  const openCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission requise", "Autorise l’accès à la caméra pour prendre une photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      base64: true,
    });
    if (result.canceled) return;

    try {
      const asset = result.assets[0];
      const mime = asset.mimeType || "image/jpeg";
      const dataUri = asset.base64
        ? `data:${mime};base64,${asset.base64}`
        : `data:image/jpeg;base64,${
            await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 })
          }`;

      setUploading(true);
      const url = await uploadDataUriToCloudinary(dataUri);
      await updateProfile(firebaseUser, { photoURL: url });
      await dbUpdate(dbRef(database, `users/${firebaseUser.uid}`), { photoURL: url });
      setPhotoURL(url);
      Alert.alert("Succès", "Photo mise à jour.");
    } catch (e) {
      console.log("Upload (caméra) error:", e);
      Alert.alert("Erreur", "Upload impossible. Vérifie le preset unsigned.");
    } finally {
      setUploading(false);
    }
  };

  const choosePhotoSource = () => {
    Alert.alert(
      "Ajouter une photo",
      "Choisis la source",
      [
        { text: "Caméra", onPress: openCamera },
        { text: "Photos", onPress: openImageLibrary },
        { text: "Annuler", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const openPreview = () => {
    setModalVisible(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };
  const closePreview = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
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

      <View style={styles.avatarRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => (editing ? choosePhotoSource() : openPreview())}
        >
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallBtn, uploading && { opacity: 0.6 }]}
          onPress={choosePhotoSource}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.smallBtnText}>
              {editing ? "Changer la photo" : "Ajouter une photo"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

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
            <Text style={styles.buttonText}>✏️ Modifier le profil</Text>
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
              style={[styles.button, { backgroundColor: "#34C759" }, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>💾 Enregistrer</Text>
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

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closePreview}>
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={closePreview}>
          <Animated.Image
            source={photoURL ? { uri: photoURL } : avatarPlaceholder}
            style={[
              styles.fullImage,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const AVATAR_SIZE = 110;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "flex-start" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center", marginTop: 40 },

  avatarRow: { alignItems: "center", marginBottom: 16 },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: "#eee" },
  avatarFallback: { alignItems: "center", justifyContent: "center", backgroundColor: "#6C63FF" },

  smallBtn: { marginTop: 10, backgroundColor: "#6C63FF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  smallBtnText: { color: "#fff", fontWeight: "700" },

  infoBox: { marginBottom: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  label: { fontSize: 14, color: "#777" },
  value: { fontSize: 18, fontWeight: "600", color: "#222", marginTop: 2 },

  editRow: { marginBottom: 12 },
  editLabel: { fontSize: 14, color: "#777", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, backgroundColor: "#fafafa", fontSize: 16 },

  button: { backgroundColor: "#6C63FF", padding: 15, borderRadius: 10, minWidth: 150, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "600" },

  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  fullImage: { width: "90%", height: "70%", borderRadius: 10 },
});
