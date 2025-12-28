import React, { useRef, useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import AppText from "../AppText";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PADDING = 16;

const CommonTooltip = ({
  children,
  content,
  placement = "center",
  verticalOffset = 6,
  tooltipWidth = 280,
  style,
}) => {
  const triggerRef = useRef(null);
  const [layout, setLayout] = useState(null);
  const [visible, setVisible] = useState(false);

  const resolvedWidth = useMemo(() => {
    if (typeof tooltipWidth === "string" && tooltipWidth.endsWith("%")) {
      return (SCREEN_WIDTH * parseFloat(tooltipWidth)) / 100;
    }
    return tooltipWidth;
  }, [tooltipWidth]);

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, w, h) => {
      setLayout({ x, y, w, h });
      setVisible(true);
    });
  };

  const getLeft = () => {
    if (!layout) return 0;

    let left =
      placement === "left"
        ? layout.x
        : placement === "right"
          ? layout.x + layout.w - resolvedWidth
          : layout.x + layout.w / 2 - resolvedWidth / 2;

    return Math.min(
      Math.max(left, PADDING),
      SCREEN_WIDTH - resolvedWidth - PADDING
    );
  };

  if (!visible || !layout) {
    return (
      <TouchableOpacity ref={triggerRef} onPress={open} style={style}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity ref={triggerRef} onPress={open} style={style}>
        {children}
      </TouchableOpacity>

      {/* Tooltip Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        {/* Backdrop */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setVisible(false)}
        />

        {/* Tooltip */}
        <View
          style={[
            styles.tooltipContainer,
            {
              top: layout.y + layout.h + verticalOffset,
              left: getLeft(),
              width: resolvedWidth,
            },
          ]}
        >
          <View style={[styles.arrow, { left: layout.w / 2 - 8 }]} >
            <AppText>asdxsj</AppText>
          </View>
          <View style={styles.card}>{content}</View>
        </View>
      </Modal>
    </>
  );
};

export default CommonTooltip;
const styles = StyleSheet.create({
  tooltipContainer: {
    position: "absolute",
    zIndex: 9999,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,   // #00000012 ≈ 7% opacity
    shadowRadius: 14,
    elevation: 6,
  },

  arrow: {
    position: "absolute",
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#fff",
  },
});
