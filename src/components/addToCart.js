// AddToCart.js
import React from "react";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import AppText from "./AppText";
import Delete from "./icons/Delete";
import { colors } from "../styles/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import Svg, { Path } from "react-native-svg";

const AddToCartWidget = ({
  style,
  item,
  isInCart,
  quantity,
  loading = false,
  handleQuantityChange,
  handleDelete,
  handleAddToCart,
  disabled = false,
  ...props
}) => {
  return (
    <View style={{ height: 45 }}>
      {isInCart ? (
        <View style={styles.quantityControls}>
          <View style={styles.quantityBox}>
            <TouchableOpacity
              disabled={loading}
              style={[styles.quantityButton,disabled && { opacity: 0.5 }]}
              onPress={() => !loading ? handleQuantityChange?.(item, "minus") : null}
            >
              <Icon name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>

            <AppText style={[styles.quantityText,disabled && { opacity: 0.5 }]}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                quantity
              )}
            </AppText>

            <TouchableOpacity
              disabled={loading}
              style={[styles.quantityButton,disabled && { opacity: 0.5 }]}
              onPress={() => !loading ? handleQuantityChange?.(item, "plus") : null}
            >
              <Icon name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            disabled={loading}
            style={[styles.deleteButton,disabled && { opacity: 0.5 }]}
            onPress={() => !loading ? handleDelete?.(item) : null}
          >
            <Delete />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          disabled={loading}
          style={[styles.addToCartButton, loading && { opacity: 0.8 },disabled && { opacity: 0.5 }]}
          onPress={() => !loading ? handleAddToCart?.(item) : null}
        >
          <View style={{ flexDirection: "row" }}>
            <AppText style={styles.addToCartText}>Add to cart </AppText>
          </View>

          <Svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.66667 13.3333C10.3487 13.3333 13.3333 10.3487 13.3333 6.66667C13.3333 2.98467 10.3487 0 6.66667 0C2.98467 0 0 2.98467 0 6.66667C0 10.3487 2.98467 13.3333 6.66667 13.3333ZM6.98 4.31333C7.07375 4.2197 7.20083 4.16711 7.33333 4.16711C7.46583 4.16711 7.59292 4.2197 7.68667 4.31333L9.68667 6.31333C9.7803 6.40708 9.83289 6.53417 9.83289 6.66667C9.83289 6.79917 9.7803 6.92625 9.68667 7.02L7.68667 9.02C7.64089 9.06912 7.58569 9.10853 7.52436 9.13585C7.46303 9.16318 7.39682 9.17788 7.32968 9.17906C7.26255 9.18025 7.19586 9.1679 7.1336 9.14275C7.07134 9.1176 7.01479 9.08017 6.96731 9.03269C6.91983 8.98521 6.8824 8.92866 6.85725 8.8664C6.8321 8.80414 6.81975 8.73745 6.82094 8.67032C6.82212 8.60318 6.83682 8.53697 6.86415 8.47564C6.89147 8.41431 6.93088 8.35911 6.98 8.31333L8.12667 7.16667H4C3.86739 7.16667 3.74021 7.11399 3.64645 7.02022C3.55268 6.92645 3.5 6.79927 3.5 6.66667C3.5 6.53406 3.55268 6.40688 3.64645 6.31311C3.74021 6.21935 3.86739 6.16667 4 6.16667H8.12667L6.98 5.02C6.88637 4.92625 6.83377 4.79917 6.83377 4.66667C6.83377 4.53417 6.88637 4.40708 6.98 4.31333Z"
              fill="white"
            />
          </Svg>
          {loading && (
            <ActivityIndicator size="small" color={"white"} />

          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F7941E1A",
    padding: 3,
    borderRadius: 5,
  },
  quantityButton: {
    width: 35,
    height: 35,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#feefdd",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 40,
    textAlign: "center",
  },
  deleteButton: {
    marginLeft: 8,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default AddToCartWidget;
