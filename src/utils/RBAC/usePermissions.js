import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hasPermission } from "./permissionHelper";

const usePermissions = () => {
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        const loadPermissions = async () => {
            try {
                const stored = await AsyncStorage.getItem("permissions");
                const parsed = JSON.parse(stored || "[]");
                setPermissions(Array.isArray(parsed) ? parsed : []);
            } catch {
                setPermissions([]);
            }
        };

        loadPermissions();
    }, []);

    const can = useCallback(
        (required) => hasPermission(permissions, required),
        [permissions]
    );

    return { permissions, can };
};

export default usePermissions;
