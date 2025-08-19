// screens/PatientListScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { database } from "../firebase";
import { onValue, ref, query, orderByChild, equalTo } from "firebase/database";

export default function PatientListScreen() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const q = query(ref(database, "patients"), orderByChild("active"), equalTo(true));
    const unsub = onValue(q, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      setRows(list.sort((a,b)=> (a.lastName||"").localeCompare(b.lastName||"")));
    });
    return () => unsub();
  }, []);

  if (!rows) {
    return <View style={styles.center}><ActivityIndicator /><Text>Loading…</Text></View>;
  }

  if (!rows.length) {
    return <View style={styles.center}><Text>No patients.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient list</Text>
      <FlatList
        data={rows}
        keyExtractor={(it)=>it.id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.lastName} {item.firstName}</Text>
            <Text style={styles.meta}>{item.room ? `Room: ${item.room}` : "No room"}</Text>
          </View>
        )}
        ItemSeparatorComponent={()=> <View style={{height:8}}/>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:"#fff" },
  title:{ fontSize:20, fontWeight:"700", marginBottom:12 },
  center:{ flex:1, alignItems:"center", justifyContent:"center" },
  card:{ padding:12, borderWidth:1, borderColor:"#eee", borderRadius:12, backgroundColor:"#fafafa" },
  name:{ fontSize:16, fontWeight:"600" },
  meta:{ color:"#666", marginTop:4 }
});
