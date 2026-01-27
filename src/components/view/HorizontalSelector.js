import React, { memo, useRef, useCallback, useEffect } from "react";
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

const HorizontalSelector = ({
    children,
    items,
    itemGap = 8,
    onTabChange,
    style,
    activeIndex,
}) => {
    const listRef = useRef(null);

    const data = items ?? React.Children.toArray(children);

    const handlePress = useCallback(
        (index) => {
            onTabChange?.(index);
        },
        [onTabChange]
    );

    useEffect(() => {
        if (
            typeof activeIndex === "number" &&
            activeIndex >= 0 &&
            data.length > 0 &&
            activeIndex < data.length
        ) {
            requestAnimationFrame(() => {
                listRef.current?.scrollToIndex({
                    index: activeIndex,
                    animated: true,
                    viewPosition: 0, // change to 0.5 if you want center scroll
                });
            });
        }
    }, [activeIndex, data.length]);

    return (
        <FlatList
            ref={listRef}
            horizontal
            data={data}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.container, style]}
            onScrollToIndexFailed={(info) => {
                if (info.index >= 0 && data.length > 0) {
                    setTimeout(() => {
                        listRef.current?.scrollToIndex({
                            index: Math.min(info.index, data.length - 1),
                            animated: true,
                        });
                    }, 100);
                }
            }}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handlePress(index)}
                    style={{ marginRight: itemGap }}
                >
                    {item}
                </TouchableOpacity>
            )}
        />
    );
};

export default memo(HorizontalSelector);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
    },
});
