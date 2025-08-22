import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { database } from "../firebase";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";

export default function HistoriqueScreen() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const q = query(ref(database, "alerts"), orderByChild("timestamp"), limitToLast(100));
    const unsub = onValue(q, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setRows(list);
    });
    return () => unsub();
  }, []);

  if (rows === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Chargement de l’historique…</Text>
      </View>
    );
  }

  if (!rows.length) {
    return (
      <View style={styles.center}>
        <Text>Aucune alerte pour le moment.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const date = item.timestamp ? new Date(item.timestamp) : null;
    const when = date ? date.toLocaleString() : "—";
    return (
      <View style={styles.item}>
        <View style={styles.line}>
          <Text style={styles.label}>Patient :</Text>
          <Text style={styles.value}>{item.patient || "—"}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.label}>Date :</Text>
          <Text style={styles.value}>{when}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.label}>Statut :</Text>
          <Text style={styles.value}>{item.status || "—"}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des alertes</Text>
      <FlatList
        data={rows}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, marginTop: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  item: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fafafa" },
  line: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#666" },
  value: { fontWeight: "600", color: "#222" },
});
