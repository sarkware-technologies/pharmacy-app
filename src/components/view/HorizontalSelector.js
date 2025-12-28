import React, { memo, useRef, useCallback, useEffect } from "react";
import {
    FlatList,
    StyleSheet,
    View,
    TouchableOpacity,
} from "react-native";

const ITEM_WIDTH = 100; // adjust if needed


const HorizontalSelector = ({ children, items, itemGap = 8, onTabChange, style, activeIndex }) => {
    const listRef = useRef(null);

    const data = items ?? React.Children.toArray(children);

    const handlePress = useCallback((index) => {
        onTabChange?.(index);
        if (activeIndex === undefined || activeIndex === null) {
            listRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0,
            });
        }
    }, [onTabChange]);

    useEffect(() => {
        if (activeIndex !== undefined && activeIndex !== null) {
            listRef.current?.scrollToIndex({
                index: activeIndex,
                animated: true,
                viewPosition: 0,
            });
        }
    }, [activeIndex]);


    return (
        <FlatList
            ref={listRef}
            horizontal
            data={data}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.container, style]}
            getItemLayout={(_, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
            })}
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
