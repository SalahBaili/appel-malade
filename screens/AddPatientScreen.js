import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { database } from "../firebase";
import { ref, push, serverTimestamp } from "firebase/database";

export default function AddPatientScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [room, setRoom] = useState("");

  const save = async () => {
    if (!firstName.trim() || !lastName.trim())
      return Alert.alert("Validation", "Nom et prénom sont obligatoires.");
    await push(ref(database, "patients"), {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      room: room.trim() || null,
      createdAt: serverTimestamp(),
      active: true,
    });
    Alert.alert("Succès", "Patient ajouté.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un patient</Text>
      <TextInput style={styles.input} placeholder="Prénom" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Nom" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Chambre (optionnel)" value={room} onChangeText={setRoom} />
      <TouchableOpacity style={styles.btn} onPress={save}><Text style={styles.btnText}>Enregistrer</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:"#fff", marginTop:40 },
  title:{ fontSize:20, fontWeight:"700", marginBottom:12 },
  input:{ borderWidth:1, borderColor:"#ddd", borderRadius:12, padding:12, marginBottom:10, backgroundColor:"#fafafa" },
  btn:{ backgroundColor:"#6C63FF", padding:14, borderRadius:14, alignItems:"center", marginTop:6 },
  btnText:{ color:"#fff", fontWeight:"700" }
});
