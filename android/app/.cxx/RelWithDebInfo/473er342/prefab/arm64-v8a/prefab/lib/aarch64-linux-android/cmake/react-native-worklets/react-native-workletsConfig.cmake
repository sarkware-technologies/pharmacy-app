if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "/home/sarkware/Workspace/SunPharma/frontend/pharmacy-app/node_modules/react-native-worklets/android/build/intermediates/cxx/RelWithDebInfo/433gns32/obj/arm64-v8a/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/sarkware/Workspace/SunPharma/frontend/pharmacy-app/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

