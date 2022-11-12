import isEqual from 'lodash/isEqual';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { PackedEvent, ThemeProperties } from '../../types';

export interface EventBlockProps {
  event: PackedEvent;
  dayIndex: number;
  columnWidth: number;
  onPressEvent?: (eventItem: PackedEvent) => void;
  onLongPressEvent?: (eventItem: PackedEvent) => void;
  timeIntervalHeight: SharedValue<number>;
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => void;
  selectedEventId?: string;
  theme: ThemeProperties;
}

const EVENT_DEFAULT_COLOR = '#FFFFFF';

const EventBlock = ({
  event,
  dayIndex,
  columnWidth,
  onPressEvent,
  onLongPressEvent,
  timeIntervalHeight,
  renderEventContent,
  selectedEventId,
  theme,
}: EventBlockProps) => {
  const _onLongPress = () => {
    const eventParams = {
      ...event,
      top: event.startHour * timeIntervalHeight.value,
      height: event.duration * timeIntervalHeight.value,
      leftByIndex: columnWidth * dayIndex,
    };
    onLongPressEvent?.(eventParams);
  };

  const _onPress = () => {
    const eventParams = {
      ...event,
      top: event.startHour * timeIntervalHeight.value,
      height: event.duration * timeIntervalHeight.value,
      leftByIndex: columnWidth * dayIndex,
    };
    onPressEvent?.(eventParams);
  };

  const eventStyle = useAnimatedStyle(() => ({
    top: event.startHour * timeIntervalHeight.value,
    height: event.duration * timeIntervalHeight.value,
  }));

  const _renderEventContent = () => {
    return <Text style={[styles.title, theme.eventTitle]}>{event.title}</Text>;
  };

  const eventOpacity = selectedEventId ? 0.6 : 1;

  return (
    <Animated.View
      style={[
        styles.eventBlock,
        {
          left: event.left + columnWidth * dayIndex,
          width: event.width,
          opacity: eventOpacity,
        },
        event.containerStyle,
        eventStyle,
      ]}
    >
      <TouchableOpacity
        delayLongPress={300}
        disabled={!!selectedEventId}
        onPress={_onPress}
        onLongPress={_onLongPress}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: event.color || EVENT_DEFAULT_COLOR },
        ]}
        activeOpacity={0.6}
      >
        {renderEventContent
          ? renderEventContent(event, timeIntervalHeight)
          : _renderEventContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const areEqual = (prev: EventBlockProps, next: EventBlockProps) => {
  const isSameEvent = isEqual(prev.event, next.event);
  const isSameSelectedId = prev.selectedEventId === next.selectedEventId;
  const isSameColumnWidth = prev.columnWidth === next.columnWidth;
  const isSameDayIndex = prev.dayIndex === next.dayIndex;
  const isSameTheme = isEqual(prev.theme, next.theme);
  return (
    isSameEvent &&
    isSameSelectedId &&
    isSameColumnWidth &&
    isSameDayIndex &&
    isSameTheme
  );
};

export default memo(EventBlock, areEqual);

const styles = StyleSheet.create({
  eventBlock: {
    position: 'absolute',
    borderRadius: 4,
    overflow: 'hidden',
  },
  title: { paddingVertical: 4, paddingHorizontal: 2, fontSize: 10 },
});
