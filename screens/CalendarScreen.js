import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

LocaleConfig.locales.fr = {
  monthNames: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
  monthNamesShort: ["Janv.","Févr.","Mars","Avr.","Mai","Juin","Juil.","Août","Sept.","Oct.","Nov.","Déc."],
  dayNames: ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],
  dayNamesShort: ["Dim.","Lun.","Mar.","Mer.","Jeu.","Ven.","Sam."],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = "fr";

export default function CalendarScreen() {
  const [selected, setSelected] = useState();

  const marked = selected ? { [selected]: { selected: true } } : {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>
      <Calendar
        onDayPress={(d) => setSelected(d.dateString)}
        markedDates={marked}
        theme={{
          selectedDayBackgroundColor: "#6C63FF",
          arrowColor: "#6C63FF",
          todayTextColor: "#6C63FF",
        }}
      />
      {selected && <Text style={{ marginTop: 12 }}>Selected: {selected}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:"#fff" },
  title:{ fontSize:20, fontWeight:"700", marginBottom:12 },
});
