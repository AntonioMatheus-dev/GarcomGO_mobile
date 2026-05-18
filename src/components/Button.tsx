import {
    StyleSheet,
    Text,
    TouchableHighlightProps,
    TouchableOpacity,
} from "react-native";

type ButtonProps = TouchableHighlightProps & {
  label: string;
};

export default function Button({ label, style, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.8}
      {...rest}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 420,
    height: 56,
    backgroundColor: "rgb(51, 122, 204)",
    alignSelf: "center",
    borderRadius: 14,
    marginTop: 18,
    borderColor: "rgba(2, 62, 139, 0.87)",
    borderWidth: 1,
    justifyContent: "center",
    shadowColor: "#2f6bb3",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
