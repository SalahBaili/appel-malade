// screens/OfficeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";

const FALLBACK = {
  serviceName: "Service d’Infirmierie – Aile A",
  description:
    "Accueil des patients, coordination des soins, gestion des chambres et transmissions.",
  address: "Bloc A, 2e étage, Chambre 201 – 205",
  officePhone: "+212 5 22 00 00 00",
  head: {
    name: "Mme Samira BENALI",
    title: "Cheffe de service",
    email: "samira.benali@example.com",
    phone: "+212 6 12 34 56 78",
  },
  hours: {
    week: "Lun – Ven : 08:00 → 18:00",
    weekend: "Sam : 09:00 → 13:00, Dim : fermé",
  },
  notes:
    "En cas d’urgence, contactez directement le numéro du bureau ou le chef de service.",
};

export default function OfficeScreen() {
  const [office, setOffice] = useState(FALLBACK);

  useEffect(() => {
    const r = ref(database, "office");
    const off = onValue(
      r,
      (snap) => {
        const v = snap.val();
        if (v && typeof v === "object") {
          // merge simple pour garder les champs manquants depuis FALLBACK
          setOffice({
            ...FALLBACK,
            ...v,
            head: { ...FALLBACK.head, ...(v.head || {}) },
            hours: { ...FALLBACK.hours, ...(v.hours || {}) },
          });
        } else {
          setOffice(FALLBACK);
        }
      },
      (err) => {
        console.log("office/onValue error:", err);
        setOffice(FALLBACK);
      }
    );
    return () => off();
  }, []);

  const call = (phone) => {
    if (!phone) return Alert.alert("Info", "Aucun numéro disponible.");
    Linking.openURL(`tel:${phone}`);
  };

  const email = (mail) => {
    if (!mail) return Alert.alert("Info", "Aucune adresse e-mail disponible.");
    const subject = encodeURIComponent("Contact – Service Infirmier");
    Linking.openURL(`mailto:${mail}?subject=${subject}`);
  };

  const SectionCard = ({ icon, title, children }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={20} color="#6C63FF" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={{ marginTop: 6 }}>{children}</View>
    </View>
  );

  const Row = ({ left, right }) => (
    <View style={styles.row}>
      <Text style={styles.left}>{left}</Text>
      <Text style={styles.right}>{right || "—"}</Text>
    </View>
  );

  const Chip = ({ icon, label, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.chip}>
      <Feather name={icon} size={16} color="#fff" />
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{office.serviceName}</Text>
      <Text style={styles.subtitle}>{office.description}</Text>

      <SectionCard icon="location-outline" title="Localisation">
        <Row left="Adresse / Aile" right={office.address} />
        <Row left="Téléphone du bureau" right={office.officePhone} />
        <View style={styles.actionsRow}>
          <Chip icon="phone-call" label="Appeler le bureau" onPress={() => call(office.officePhone)} />
        </View>
      </SectionCard>

      <SectionCard icon="people-outline" title="Chef de service">
        <Row left="Nom" right={office.head?.name} />
        <Row left="Fonction" right={office.head?.title} />
        <Row left="Téléphone" right={office.head?.phone} />
        <Row left="E-mail" right={office.head?.email} />
        <View style={styles.actionsRow}>
          <Chip icon="phone" label="Appeler" onPress={() => call(office.head?.phone)} />
          <Chip icon="mail" label="Écrire" onPress={() => email(office.head?.email)} />
        </View>
      </SectionCard>

      <SectionCard icon="time-outline" title="Horaires">
        <Row left="Semaine" right={office.hours?.week} />
        <Row left="Weekend" right={office.hours?.weekend} />
      </SectionCard>

      <SectionCard icon="alert-circle-outline" title="Notes">
        <Text style={styles.notes}>{office.notes}</Text>
      </SectionCard>

      <View style={{ height: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F7F8FC",marginTop: 40 },
  title: { fontSize: 20, fontWeight: "800", color: "#222" },
  subtitle: { color: "#555", marginTop: 6, marginBottom: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#333" },

  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  left: { color: "#666" },
  right: { color: "#111", fontWeight: "600", maxWidth: "58%", textAlign: "right" },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#6C63FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: { color: "#fff", fontWeight: "700" },

  notes: { color: "#333" },
});
