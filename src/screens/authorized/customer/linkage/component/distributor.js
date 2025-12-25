import { ScrollView, View } from "react-native";
import { AppText } from "../../../../../components";
import Linkagestyles from "../style/linkagestyle";

const DistributorLinkage = ({ customerData, isLoading, isChild, saveDraft }) => {

    return (
        <View style={Linkagestyles.accordionCardG}>
            {/* Header (FIXED) */}
            <View style={Linkagestyles.header}>


            </View>

            {/* Body (SCROLLABLE) */}
            <ScrollView
                style={Linkagestyles.body}
                contentContainerStyle={Linkagestyles.bodyContent}
                showsVerticalScrollIndicator={false}
            >

            </ScrollView>

            {/* Footer (FIXED) */}
            <View style={Linkagestyles.footer}>

            </View>
        </View>
    )

}

export default DistributorLinkage;