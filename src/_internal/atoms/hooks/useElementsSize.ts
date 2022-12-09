import { isEqual, omit } from "lodash";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { getSize } from "../dom";

type Size<K extends string> = Record<K, { width: number; height: number }>;
function getAllSize<K extends string>(classMap: Record<K, string>) {
  return Object.keys(classMap).reduce((prev: Size<K>, cur) => {
    prev[cur as K] = getSize(
      document.querySelector<HTMLElement>(classMap[cur as K])
    );
    return prev;
  }, {} as Size<K>);
}

const elementsSizes: Record<
  string,
  Record<
    string,
    {
      width: number;
      height: number;
    }
  >
> = {};

export default function useElementsSize<K extends string>(
  classMap: Record<K, string>,
  config: { prevent?: boolean; key?: string; dependencyList?: unknown[] }
) {
  const { prevent, key, dependencyList } = config;
  const preSizes = useRef<Record<K, { width: number; height: number }>>();
  const [sizes, setSizes] = useState(() => {
    if (key && elementsSizes[key]) {
      return elementsSizes[key];
    }
    const initSizes = Object.keys(classMap).reduce((prev: Size<K>, cur) => {
      prev[cur as K] = { width: 0, height: 0 };
      return prev;
    }, {} as Size<K>);
    preSizes.current = initSizes;
    return initSizes;
  });

  const classMapRef = useRef(classMap);
  classMapRef.current = classMap;

  const handleResize = useCallback(() => {
    if (prevent) return;

    const nextSizes = getAllSize<K>(classMapRef.current);

    if (key) {
      if (
        !elementsSizes[key] ||
        // FIXME: antd 4.0 table thead will be delay render
        !isEqual(omit(elementsSizes[key], "thead"), omit(nextSizes, "thead"))
      ) {
        elementsSizes[key] = nextSizes;
        setSizes(nextSizes);
      }
    } else if (!isEqual(preSizes.current, nextSizes)) {
      preSizes.current = nextSizes;
      setSizes(nextSizes);
    }
    // dependencyList is only used dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevent, key, ...(dependencyList || [])]);

  useLayoutEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // if (typeof ResizeObserver === 'function') {
    //   const resizeObserver = new ResizeObserver(handleResize);
    //   Object.values(classMap).forEach(klass => {
    //     const el = document.querySelector<HTMLElement>(klass as string);
    //     el && resizeObserver.observe(el);
    //   });
    //   return () => resizeObserver.disconnect();
    // } else {
    //   window.addEventListener('resize', handleResize);
    //   return () => window.removeEventListener('resize', handleResize);
    // }
    // classMap should be static
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleResize]);

  return sizes;
}
