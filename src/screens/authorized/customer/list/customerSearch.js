import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import AppView from "../../../../components/AppView";
import Liststyles from "./style/listStyle"
import { SafeAreaView } from "react-native-safe-area-context";
import Container from "../../../../components/view/container"
import React, { useEffect, useRef, useState } from "react";
import CustomerListContainer from "./component/CustomerListContainer"
import CustomerSearch from "./component/CustomerSearch"

const CustomerSearchPage = ({ }) => {

    const route = useRoute();

    const {
        activeTabValue,
        activeTabSubValue,
        filter = null
    } = route.params || {};


    const [appliedFilter, setAppliedFilter] = useState(filter);
    const [searchText, setSearchText] = useState("");


    const handleApplyFilters = (val) => {
        setAppliedFilter(val);
    }
    const searchRef = useRef(null);

    useFocusEffect(
        React.useCallback(() => {
            setTimeout(() => {
                searchRef.current?.focus();
            }, 200);
        }, [])
    );


    return (
        <SafeAreaView style={Liststyles.safeArea} edges={['top']}>
            <Container
                backgroundColor={"#f6f6f6"}
                isScroll={false}
                header={
                    <AppView backgroundColor={"white"} paddingHorizontal={15} paddingBottom={10}>
                        <CustomerSearch searchRef={searchRef} backgroundColor={{ searchBar: "#EDEDED", searchContainer: '#fff' }}
                            filterConfig={{ backButton: true, search: true, filter: true, calender: false }} searchText={searchText} setSearchText={setSearchText} appliedFilter={appliedFilter} handleApplyFilters={(val) => handleApplyFilters(val)} />
                    </AppView>
                }
                body={
                    <CustomerListContainer
                        search={searchText}
                        isActive={true}
                        primaryTab={activeTabValue}
                        secondaryTab={activeTabSubValue}
                        appliedFilter={appliedFilter}
                        searchRequired={true}
                    />

                }
            />
        </SafeAreaView>
    );
};


export default CustomerSearchPage;