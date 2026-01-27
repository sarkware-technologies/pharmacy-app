import AsyncStorage from "@react-native-async-storage/async-storage";

const checkPermission = async (permission) => {
    const permissionsString = await AsyncStorage.getItem("permissions");

    if (!permissionsString) return false;

    let permissions = [];

    try {
        permissions = JSON.parse(permissionsString) || [];
    } catch (e) {
        return false;
    }
    if (!Array.isArray(permissions)) return false;

    if (Array.isArray(permission)) {
        return permission.some((p) => permissions.includes(p));
    }

    return permissions.includes(permission);
};

export default checkPermission;


export const hasPermission = (userPermissions = [], required = []) => {
    if (!Array.isArray(userPermissions)) return false;

    if (Array.isArray(required)) {
        return required.some(p => userPermissions.includes(p));
    }

    return userPermissions.includes(required);
};
