export const handleDisabledTime = (
  hoursMax: number,
  minutesMax: number,
  secondsMax: number
) => {
  return {
    disabledHours: () => {
      const hours = [];
      for (let i = 0; i < 24; i++) {
        if (i > hoursMax) {
          hours.push(i);
        }
      }
      return hours;
    },
    disabledMinutes: () => {
      const minutes = [];
      for (let i = 0; i < 60; i++) {
        if (i > minutesMax) {
          minutes.push(i);
        }
      }
      return minutes;
    },
    disabledSeconds: () => {
      const seconds = [];
      for (let i = 0; i < 60; i++) {
        if (i > secondsMax) {
          seconds.push(i);
        }
      }
      return seconds;
    },
  };
};
