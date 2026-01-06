import { TouchableOpacity } from "react-native";
import AppText from "../AppText";

const TextButton = ({ children, color = "#F7941E", fontWeight, fontFamily = "regular", fontSize, letterSpacing, onPress,...props }) => {
    return (
        <TouchableOpacity style={{ ...props }} onPress={()=>onPress?.()}>
            <AppText color={color} fontWeight={fontWeight} fontFamily={fontFamily} fontSize={fontSize} letterSpacing={letterSpacing}> {children}</AppText>
        </TouchableOpacity>
    )
}



export default TextButton;