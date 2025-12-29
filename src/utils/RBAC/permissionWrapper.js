import React, { useEffect, useState } from "react";
import checkPermission from "./permissionHelper";

const PermissionWrapper = ({ permission, Component, children }) => {
    const [allowed, setAllowed] = useState(permission ? false : true);

    useEffect(() => {
        if (permission) {
            const verify = async () => {
                const has = await checkPermission(permission);
                setAllowed(has);
            };
            verify();
        }
    }, [permission]);

    if (!allowed) return null;

    if (Component) return <Component />;

    return <>{children}</>;
};

export default PermissionWrapper;
