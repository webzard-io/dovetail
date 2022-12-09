import { RefObject } from "react";

export function getSize(el: HTMLElement | null) {
  if (!el) {
    return {
      width: 0,
      height: 0,
    };
  }

  return {
    width: el.offsetWidth,
    height: el.offsetHeight,
  };
}

export function handleWhitelistClickEvent(
  wrapperRef: RefObject<Element>,
  whitelist: string[],
  cb: () => void
) {
  return (e: MouseEvent) => {
    if (!e.target) {
      return;
    }
    const target = e.target as HTMLElement;
    const wrapper = wrapperRef.current;
    if (
      !wrapper?.contains(target) &&
      !whitelist.find((klass) => target.closest(klass))
    ) {
      cb();
    }
  };
}
