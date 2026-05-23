import React, { useRef, useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/components/ThemeProvider";

interface WheelPickerProps {
  label: string;
  items: { value: number; label: string; disabled?: boolean }[];
  value: number;
  onChange: (value: number) => void;
  itemWidth?: number;
  visibleItems?: number;
}

const DEFAULT_ITEM_WIDTH = 80;
const DEFAULT_VISIBLE = 3;

export function WheelPicker({
  label,
  items,
  value,
  onChange,
  itemWidth = DEFAULT_ITEM_WIDTH,
  visibleItems = DEFAULT_VISIBLE,
}: WheelPickerProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();
  const [containerWidth, setContainerWidth] = useState(
    Math.min(Dimensions.get("window").width - 48, itemWidth * visibleItems)
  );

  const responsiveItemWidth = Math.min(
    itemWidth,
    Math.floor((Dimensions.get("window").width - 48) / Math.max(visibleItems, 3))
  );

  const finalContainerWidth = responsiveItemWidth * visibleItems;
  const padding = responsiveItemWidth * Math.floor(visibleItems / 2);

  useEffect(() => {
    const idx = items.findIndex((i) => i.value === value);
    if (idx >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: idx * responsiveItemWidth, animated: false });
    }
  }, [value, responsiveItemWidth, items]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      const idx = Math.round(offsetX / responsiveItemWidth);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const target = items[clamped];
      if (target && !target.disabled) {
        onChange(target.value);
        scrollRef.current?.scrollTo({
          x: clamped * responsiveItemWidth,
          animated: true,
        });
      } else {
        const prevIdx = items.findIndex((i) => i.value === value);
        if (prevIdx >= 0) {
          scrollRef.current?.scrollTo({
            x: prevIdx * responsiveItemWidth,
            animated: true,
          });
        }
      }
    }, 150);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.fgTertiary }]}>{label}</Text>
      <View style={[styles.pickerContainer, { width: finalContainerWidth }]}>
        {/* Selection highlight */}
        <View
          style={[
            styles.selectionHighlight,
            {
              left: padding,
              width: responsiveItemWidth,
              borderColor: colors.borderSubtle,
            },
          ]}
        />

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={responsiveItemWidth}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: padding,
          }}
        >
          {items.map((item) => {
            const isSelected = item.value === value;
            return (
              <View
                key={item.value}
                style={[
                  styles.item,
                  { width: responsiveItemWidth },
                ]}
              >
                <Text
                  style={[
                    isSelected ? styles.selectedText : styles.itemText,
                    {
                      color: item.disabled
                        ? colors.fgQuaternary
                        : isSelected
                        ? colors.fgPrimary
                        : colors.fgTertiary,
                      fontFamily: isSelected ? "Fraunces" : "Manrope",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: 12,
    fontFamily: "Manrope",
  },
  pickerContainer: {
    position: "relative",
    height: 48,
  },
  selectionHighlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    zIndex: 10,
    pointerEvents: "none",
  },
  item: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 16,
  },
  selectedText: {
    fontSize: 24,
    fontWeight: "400",
  },
});
