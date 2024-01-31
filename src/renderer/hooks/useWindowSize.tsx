// An highlighted block
import { useEffect, useState } from 'react';

interface WindowSize {
  windowWidth: number;
  windowHeight: number;
}

function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    windowWidth: 0,
    windowHeight: 0,
  });

  useEffect(() => {
    const handler = () => {
      setWindowSize({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    };

    // Set size at the first client-side load
    handler();

    window.addEventListener('resize', handler);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return windowSize;
}

export default useWindowSize;
