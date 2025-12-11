import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PermissionWrapper = ({ permission, children }) => {
    const [allowed, setAllowed] = useState(true);

    useEffect(() => {
        const checkPermission = async () => {
            const str = await AsyncStorage.getItem("permissions");
            if (!str) {
                setAllowed(false);
                return;
            }

            try {
                const list = JSON.parse(str);
                setAllowed(Array.isArray(list) && list.includes(permission));
            } catch {
                setAllowed(false);
            }
        };

        checkPermission();
    }, [permission]);

    if (!allowed) return null;

    return <>{children}</>;
};


export default PermissionWrapper;