import {StyleSheet, TextInput, TextInputProps} from "react-native";

export default function Input({...rest}: TextInputProps) {
  return <TextInput style={styles.input} {...rest} placeholderTextColor={"rgba(88, 197, 240, 0.54)"}/>;
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    maxWidth: 400,
    height: 60,
    borderRadius: 10,
    alignSelf: "center",
    borderColor: "rgba(167, 181, 197, 0.87)",
    borderWidth: 1,
    padding: 10,
  },
});

Input.displayName = "input";
