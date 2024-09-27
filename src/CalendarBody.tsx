import React, { useCallback, useMemo } from 'react';
import {
  RefreshControl,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import BodyItem from './components/BodyItem';
import CalendarListView from './components/CalendarListView';
import DragEventPlaceholder from './components/DraggingEvent';
import DraggingHour from './components/DraggingHour';
import TimeColumn from './components/TimeColumn';
import { EXTRA_HEIGHT, ScrollType } from './constants';
import { useActions } from './context/ActionsProvider';
import { BodyContext, type BodyContextProps } from './context/BodyContext';
import { useCalendar } from './context/CalendarProvider';
import { useLocale } from './context/LocaleProvider';
import useDragEventGesture from './hooks/useDragEventGesture';
import useDragToCreateGesture from './hooks/useDragToCreateGesture';
import usePinchToZoom from './hooks/usePinchToZoom';
import useSyncedList from './hooks/useSyncedList';
import type { CalendarBodyProps } from './types';
import {
  dateTimeToISOString,
  parseDateTime,
  toHourStr,
} from './utils/dateUtils';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const CalendarBody: React.FC<CalendarBodyProps> = ({
  hourFormat = 'HH:mm',
  renderHour,
  showNowIndicator = true,
  renderCustomOutOfRange,
  renderCustomUnavailableHour,
  renderEvent,
  renderDraggableEvent,
  renderDraggingEvent,
  renderDraggingHour,
  NowIndicatorComponent,
}) => {
  const {
    calendarLayout,
    hourWidth,
    columnWidthAnim,
    numberOfDays,
    offsetY,
    minuteHeight,
    maxTimelineHeight,
    maxTimeIntervalHeight,
    minTimeIntervalHeight,
    timeIntervalHeight,
    allowPinchToZoom,
    spaceFromTop,
    spaceFromBottom,
    timelineHeight,
    slots,
    totalSlots,
    start,
    end,
    timeInterval,
    columnWidth,
    scrollVisibleHeight,
    verticalListRef,
    visibleDateUnix,
    gridListRef,
    calendarData,
    calendarGridWidth,
    initialOffset,
    isRTL,
    columns,
    snapToInterval,
    calendarListRef,
    startOffset,
    scrollVisibleHeightAnim,
    visibleDateUnixAnim,
    pagesPerSide,
    rightEdgeSpacing,
    overlapEventsSpacing,
  } = useCalendar();
  const locale = useLocale();
  const { onRefresh, onLoad } = useActions();

  const { onScroll, onVisibleColumnChanged } = useSyncedList({
    id: ScrollType.calendarGrid,
  });

  const animContentStyle = useAnimatedStyle(() => ({
    height: timelineHeight.value,
  }));

  const { pinchGesture, pinchGestureRef } = usePinchToZoom();
  const { gesture: dragEventGesture, isDragging: isDraggingEvent } =
    useDragEventGesture();
  const { isDragging: isDraggingCreate, gesture: dragToCreateGesture } =
    useDragToCreateGesture();

  const _onLayout = (event: LayoutChangeEvent) => {
    scrollVisibleHeight.current = event.nativeEvent.layout.height;
    scrollVisibleHeightAnim.value = event.nativeEvent.layout.height;
  };

  const _onRefresh = useCallback(() => {
    if (onRefresh) {
      const date = parseDateTime(visibleDateUnix.current);
      onRefresh(dateTimeToISOString(date));
    }
  }, [onRefresh, visibleDateUnix]);

  const extraData = useMemo(() => {
    return {
      minDate: calendarData.minDateUnix,
      isRTL,
      numberOfDays,
      columns,
      visibleDatesArray: calendarData.visibleDatesArray,
      renderDraggableEvent,
    };
  }, [
    calendarData.minDateUnix,
    calendarData.visibleDatesArray,
    isRTL,
    numberOfDays,
    columns,
    renderDraggableEvent,
  ]);

  const _renderTimeSlots = useCallback(
    (index: number, extra: typeof extraData) => {
      const pageIndex = index * extra.columns;
      const dateUnixByIndex = extra.visibleDatesArray[pageIndex];
      if (!dateUnixByIndex) {
        return null;
      }

      return (
        <BodyItem
          pageIndex={pageIndex}
          startUnix={dateUnixByIndex}
          renderDraggableEvent={extra.renderDraggableEvent}
        />
      );
    },
    []
  );

  const _onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetY.value = e.nativeEvent.contentOffset.y;
  };

  const extraScrollData = useMemo(() => {
    return {
      visibleDates: calendarData.visibleDatesArray,
      visibleColumns: numberOfDays,
    };
  }, [calendarData.visibleDatesArray, numberOfDays]);

  const hours = useMemo(() => {
    return slots.map((slot) => {
      return {
        slot,
        time: toHourStr(slot, hourFormat, locale.meridiem),
      };
    });
  }, [hourFormat, locale.meridiem, slots]);

  const value = useMemo<BodyContextProps>(
    () => ({
      renderHour,
      offsetY,
      minuteHeight,
      maxTimelineHeight,
      maxTimeIntervalHeight,
      minTimeIntervalHeight,
      timeIntervalHeight,
      allowPinchToZoom,
      spaceFromTop,
      spaceFromBottom,
      timelineHeight,
      hours,
      hourFormat,
      totalSlots,
      columnWidthAnim,
      numberOfDays,
      hourWidth,
      start,
      end,
      timeInterval,
      showNowIndicator,
      columnWidth,
      calendarLayout,
      isRTL,
      columns,
      calendarData,
      renderCustomOutOfRange,
      renderCustomUnavailableHour,
      renderEvent,
      startOffset,
      rightEdgeSpacing,
      overlapEventsSpacing,
      visibleDateUnixAnim,
      NowIndicatorComponent,
    }),
    [
      renderHour,
      offsetY,
      minuteHeight,
      maxTimelineHeight,
      maxTimeIntervalHeight,
      minTimeIntervalHeight,
      timeIntervalHeight,
      allowPinchToZoom,
      spaceFromTop,
      spaceFromBottom,
      timelineHeight,
      hours,
      hourFormat,
      totalSlots,
      columnWidthAnim,
      numberOfDays,
      hourWidth,
      start,
      end,
      timeInterval,
      showNowIndicator,
      columnWidth,
      calendarLayout,
      isRTL,
      columns,
      calendarData,
      renderCustomOutOfRange,
      renderCustomUnavailableHour,
      renderEvent,
      startOffset,
      rightEdgeSpacing,
      overlapEventsSpacing,
      visibleDateUnixAnim,
      NowIndicatorComponent,
    ]
  );

  const composedGesture = Gesture.Race(
    pinchGesture,
    dragEventGesture,
    dragToCreateGesture
  );

  const leftSize = numberOfDays > 1 ? hourWidth : 0;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <AnimatedScrollView
          ref={verticalListRef}
          scrollEventThrottle={16}
          pinchGestureEnabled={false}
          showsVerticalScrollIndicator={false}
          onLayout={_onLayout}
          scrollEnabled={!isDraggingEvent && !isDraggingCreate}
          onScroll={_onScroll}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={false} onRefresh={_onRefresh} />
            ) : undefined
          }
          simultaneousHandlers={pinchGestureRef}
        >
          <BodyContext.Provider value={value}>
            <Animated.View
              style={[{ width: calendarLayout.width }, animContentStyle]}
            >
              <View
                style={[
                  styles.absolute,
                  { top: -EXTRA_HEIGHT, width: calendarLayout.width },
                ]}
              >
                {numberOfDays > 1 && <TimeColumn />}
                <View
                  style={[
                    styles.absolute,
                    {
                      left: Math.max(0, leftSize - 1),
                      width: calendarLayout.width - leftSize,
                    },
                  ]}
                >
                  <CalendarListView
                    ref={calendarListRef}
                    animatedRef={gridListRef}
                    count={calendarData.count}
                    scrollEnabled={!isDraggingEvent && !isDraggingCreate}
                    width={calendarGridWidth}
                    height={maxTimelineHeight + EXTRA_HEIGHT * 2}
                    renderItem={_renderTimeSlots}
                    extraData={extraData}
                    inverted={isRTL}
                    snapToInterval={snapToInterval}
                    initialOffset={initialOffset}
                    onScroll={onScroll}
                    columnsPerPage={columns}
                    onVisibleColumnChanged={onVisibleColumnChanged}
                    renderAheadItem={pagesPerSide}
                    extraScrollData={extraScrollData}
                    onLoad={onLoad}
                  />
                </View>
                <View
                  pointerEvents="box-none"
                  style={[
                    styles.absolute,
                    { top: EXTRA_HEIGHT + spaceFromTop },
                    styles.dragContainer,
                  ]}
                >
                  <DragEventPlaceholder
                    renderDraggingEvent={renderDraggingEvent}
                  />
                  <DraggingHour renderHour={renderDraggingHour} />
                </View>
              </View>
            </Animated.View>
          </BodyContext.Provider>
        </AnimatedScrollView>
      </GestureDetector>
    </View>
  );
};

export default React.memo(CalendarBody);

const styles = StyleSheet.create({
  container: { flex: 1 },
  absolute: { position: 'absolute' },
  dragContainer: { zIndex: 99999 },
});
