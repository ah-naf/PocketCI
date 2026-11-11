import { useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollViewInstance } from 'react-native';

const BOTTOM_TOLERANCE = 40;

export function useAutoScroll() {
  const ref = useRef<ScrollViewInstance>(null);
  const atBottomRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  function updateAtBottom(value: boolean) {
    if (value === atBottomRef.current) return;
    atBottomRef.current = value;
    setAtBottom(value);
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    updateAtBottom(contentSize.height - (contentOffset.y + layoutMeasurement.height) < BOTTOM_TOLERANCE);
  }

  function onContentSizeChange() {
    if (atBottomRef.current) ref.current?.scrollToEnd({ animated: false });
  }

  function scrollToBottom() {
    updateAtBottom(true);
    ref.current?.scrollToEnd({ animated: true });
  }

  return { ref, atBottom, onScroll, onContentSizeChange, scrollToBottom };
}
