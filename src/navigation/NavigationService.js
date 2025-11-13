let navigatorRef = null;

export function setTopLevelNavigator(ref) {
    navigatorRef = ref;
}

export function navigate(name, params) {
    if (navigatorRef) {
        navigatorRef.navigate(name, params);
    }
}

export function resetTo(routeName) {
    if (navigatorRef) {
        navigatorRef.reset({
            index: 0,
            routes: [{ name: routeName }],
        });
    }
}
