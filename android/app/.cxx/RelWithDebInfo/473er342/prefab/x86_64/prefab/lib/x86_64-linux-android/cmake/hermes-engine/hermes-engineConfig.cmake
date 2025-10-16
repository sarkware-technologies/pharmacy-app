if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/sarkware/.gradle/caches/8.14.3/transforms/bbf7357ad895cc3671b199768384f733/transformed/hermes-android-0.81.1-release/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/sarkware/.gradle/caches/8.14.3/transforms/bbf7357ad895cc3671b199768384f733/transformed/hermes-android-0.81.1-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

