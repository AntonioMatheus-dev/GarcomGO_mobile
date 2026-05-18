import { StyleSheet, TextInput, TextInputProps } from "react-native";

export default function Input({ ...rest }: TextInputProps) {
  return (
    <TextInput
      style={styles.input}
      {...rest}
      placeholderTextColor="rgba(51, 122, 204, 0.5)"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    maxWidth: 420,
    minHeight: 56,
    borderRadius: 16,
    alignSelf: "center",
    borderColor: "rgba(167, 181, 197, 0.87)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    color: "#234f8f",
    fontSize: 16,
    shadowColor: "#2f6bb3",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
});

Input.displayName = "input";
