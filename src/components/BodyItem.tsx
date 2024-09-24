import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { EXTRA_HEIGHT } from '../constants';
import { useBody } from '../context/BodyContext';
import DraggableEvent, { DraggableEventProps } from './DraggableEvent';
import Events from './Events';
import LoadingOverlay from './Loading/Overlay';
import NowIndicator from './NowIndicator';
import TimelineBoard from './TimelineBoard';

interface MultipleBodyItemProps {
  pageIndex: number;
  startUnix: number;
  renderDraggableEvent?: (
    props: DraggableEventProps
  ) => React.ReactElement | null;
}

const BodyItem = ({
  pageIndex,
  startUnix,
  renderDraggableEvent,
}: MultipleBodyItemProps) => {
  const {
    spaceFromTop,
    timelineHeight,
    spaceFromBottom,
    hourWidth,
    numberOfDays,
    calendarData,
    columns,
  } = useBody();

  const visibleDates = useMemo(() => {
    let data: Record<string, { diffDays: number; unix: number }> = {};
    let diffDays = 1;
    for (let i = 0; i < columns; i++) {
      const currentUnix = calendarData.visibleDatesArray[pageIndex + i];
      if (currentUnix) {
        data[currentUnix] = {
          unix: currentUnix,
          diffDays: diffDays,
        };
        diffDays += 1;
      }
    }

    return data;
  }, [calendarData.visibleDatesArray, columns, pageIndex]);

  const leftSpacing = numberOfDays === 1 ? hourWidth : 0;

  const height = useDerivedValue(() => {
    return timelineHeight.value - spaceFromTop - spaceFromBottom;
  }, [spaceFromTop, spaceFromBottom]);

  const animView = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <View style={styles.container}>
      <TimelineBoard
        pageIndex={pageIndex}
        dateUnix={startUnix}
        visibleDates={visibleDates}
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.content,
          {
            left: Math.max(0, leftSpacing - 1),
            top: EXTRA_HEIGHT + spaceFromTop,
          },
          animView,
        ]}
      >
        <Events startUnix={startUnix} visibleDates={visibleDates} />
        <NowIndicator startUnix={startUnix} visibleDates={visibleDates} />
        <DraggableEvent
          startUnix={startUnix}
          visibleDates={visibleDates}
          renderDraggableEvent={renderDraggableEvent}
        />
      </Animated.View>
      <LoadingOverlay />
    </View>
  );
};

export default BodyItem;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { position: 'absolute', width: '100%' },
});