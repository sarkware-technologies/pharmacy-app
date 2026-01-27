import { ScrollView, StatusBar, StyleSheet } from "react-native";
import AppView from "../AppView"
import AnimatedContent from "./AnimatedContent"
import { colors } from "../../styles/colors";

const Container = ({ header, body, footer, isScroll = true, statusBar = true,backgroundColor }) => {
    return (
        <AppView style={styles.accordionCardG} backgroundColor={backgroundColor}>
            <AppView style={styles.header}>
                {statusBar && (
                    <StatusBar backgroundColor="#fff" barStyle="dark-content" />
                )}
                {header}
            </AppView>
            <AnimatedContent style={[styles.body, { paddingHorizontal: 7, paddingTop: 10 }]}>
                {isScroll ? (
                    <ScrollView >
                        {body}
                    </ScrollView>
                ) : (body)}
            </AnimatedContent>

            <AppView style={styles.footer}>
                {footer}
            </AppView>
        </AppView>
    )
}


export default Container;

const styles = StyleSheet.create({
    accordionCardG: {
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        paddingBottom: 20,
    },
    header: {
        paddingBottom: 0,
    },
    body: {
        flex: 1,
    },
    footer: {

    },
});
