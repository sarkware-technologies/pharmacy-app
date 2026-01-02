import React, { useRef, useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PADDING = 16;
const ARROW_HALF = 8;

const CommonTooltip = ({
  children,
  content,
  placement = "center",
  verticalOffset = 6,
  tooltipWidth = 280,
  style,
  backgroundColor = "#fff",
}) => {
  const triggerRef = useRef(null);
  const [layout, setLayout] = useState(null);
  const [visible, setVisible] = useState(false);

  /* ---------- Width ---------- */
  const resolvedWidth = useMemo(() => {
    if (typeof tooltipWidth === "string" && tooltipWidth.endsWith("%")) {
      return (SCREEN_WIDTH * parseFloat(tooltipWidth)) / 100;
    }
    return tooltipWidth;
  }, [tooltipWidth]);

  /* ---------- Open Tooltip ---------- */
  const open = () => {
    triggerRef.current?.measureInWindow((x, y, w, h) => {
      setLayout({ x, y, w, h });
      setVisible(true);
    });
  };

  /* ---------- Tooltip Left ---------- */
  const getTooltipLeft = () => {
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

  /* ---------- Arrow Left (relative to tooltip) ---------- */
  const getArrowLeft = (tooltipLeft) => {
    if (!layout) return 0;

    const triggerCenterX = layout.x + layout.w / 2;
    const rawLeft = triggerCenterX - tooltipLeft - ARROW_HALF;

    return Math.min(
      Math.max(rawLeft, ARROW_HALF),
      resolvedWidth - ARROW_HALF * 2
    );
  };

  if (!visible || !layout) {
    return (
      <TouchableOpacity ref={triggerRef} onPress={open} style={style}>
        {children}
      </TouchableOpacity>
    );
  }

  const tooltipLeft = getTooltipLeft();
  const arrowLeft = getArrowLeft(tooltipLeft);

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity ref={triggerRef} onPress={open} style={style}>
        {children}
      </TouchableOpacity>

      {/* Tooltip */}
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

        <View
          style={[
            styles.tooltipContainer,
            {
              top: layout.y + layout.h + verticalOffset,
              left: tooltipLeft,
              width: resolvedWidth,
            },
          ]}
        >
          {/* Arrow */}
          <View
            style={[
              styles.arrow,
              {
                left: arrowLeft,
                borderBottomColor: backgroundColor,
              },
            ]}
          />

          {/* Card */}
          <View style={[styles.card, { backgroundColor }]}>
            {content}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CommonTooltip;

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  tooltipContainer: {
    position: "absolute",
    zIndex: 9999,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
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
  },
});
