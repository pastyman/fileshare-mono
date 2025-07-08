import React, { useState, useEffect, ReactNode } from 'react';

type CountdownTimerProps = {
  initialTime: number;
  activeMessage: (formattedTime: string) => ReactNode;
  expiredMessage: ReactNode;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialTime,
  activeMessage,
  expiredMessage,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) {
      setExpired(true);
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          setExpired(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  };

  return (
    <div>
      {expired ? (
        <>{expiredMessage}</>
      ) : (
        <>{activeMessage(formatTime(timeRemaining))}</>
      )}
    </div>
  );
};

export default CountdownTimer;
