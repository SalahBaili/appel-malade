import { ref, onValue } from "firebase/database";
import { database } from './firebase';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function HistoriqueScreen() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const alertsRef = ref(database, 'alerts');
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setAlerts(list.reverse());
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des alertes</Text>
      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.alertItem}>
            <Text>Patient : {item.patient}</Text>
            <Text>Status : {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  alertItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
});
