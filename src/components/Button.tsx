import {
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    TouchableHighlightProps 
} from "react-native";

type ButtonProps = TouchableHighlightProps & {
    label: string;
}

export default function Button({label, ...rest}: ButtonProps){
    return(
        <TouchableOpacity style={styles.container} activeOpacity={0.8} {...rest}>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 300,
        height: 60,
        backgroundColor: "rgb(51, 122, 204)",
        alignSelf: "center",
        borderRadius: 10,
        marginTop: 30,
        borderColor: "rgba(2, 62, 139, 0.87)",
        borderWidth: 1,
    },
    label:{
        color: "#fff",
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        lineHeight: 60,
    }
});

