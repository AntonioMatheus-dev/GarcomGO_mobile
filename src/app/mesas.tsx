import { StyleSheet, Text, View } from "react-native";

export default function MesasPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>Tela de mesas em desenvolvimento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dce5ff",
    padding: 24,
  },
  message: {
    color: "#337acc",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
});
