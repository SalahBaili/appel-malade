import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { database } from "../firebase";
import { ref, push, serverTimestamp } from "firebase/database";

export default function AddRoomScreen({ navigation }) {
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");

  const save = async () => {
    if (!name.trim()) return Alert.alert("Validation", "Le nom de la chambre est obligatoire.");
    await push(ref(database, "rooms"), {
      name: name.trim(),
      floor: floor.trim() || null,
      createdAt: serverTimestamp(),
    });
    Alert.alert("Succès", "Chambre ajoutée.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter une chambre</Text>
      <TextInput style={styles.input} placeholder="Nom de la chambre" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Étage / Aile (optionnel)" value={floor} onChangeText={setFloor} />
      <TouchableOpacity style={styles.btn} onPress={save}><Text style={styles.btnText}>Enregistrer</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:"#fff" },
  title:{ fontSize:20, marginTop:40, fontWeight:"700", marginBottom:12 },
  input:{ borderWidth:1, borderColor:"#ddd", borderRadius:12, padding:12, marginBottom:10, backgroundColor:"#fafafa" },
  btn:{ backgroundColor:"#6C63FF", padding:14, borderRadius:14, alignItems:"center", marginTop:6 },
  btnText:{ color:"#fff", fontWeight:"700" }
});
