// HistoriqueScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { database } from "../firebase";
import { onValue, ref, query, orderByChild, limitToLast } from "firebase/database";

export default function HistoriqueScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alertsRef = query(ref(database, "alerts"), orderByChild("timestamp"), limitToLast(100));
    const unsub = onValue(alertsRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setRows(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Chargement…</Text>
      </View>
    );
  }

  if (!rows.length) {
    return (
      <View style={styles.center}>
        <Text>Aucune alerte enregistrée.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>      Historique des alertes :        </Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.patient}>{item.patient}</Text>
            <Text style={styles.meta}>
              {new Date(item.timestamp).toLocaleString()} • {item.status}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold" ,padding: 30},
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, backgroundColor: "#fff" },
  patient: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#666", marginTop: 8 },
});
