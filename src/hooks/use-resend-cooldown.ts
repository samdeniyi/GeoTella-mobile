import { useCallback, useEffect, useRef, useState } from 'react';

export type ResendCooldown = {
  secondsLeft: number;
  isCoolingDown: boolean;
  start: () => void;
};

export const useResendCooldown = (seconds = 60): ResendCooldown => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    clear();
    setSecondsLeft(seconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clear();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [seconds]);

  useEffect(() => clear, []);

  return { secondsLeft, isCoolingDown: secondsLeft > 0, start };
};
