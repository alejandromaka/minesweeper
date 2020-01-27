import * as React from 'react';
const styles = require('./App.scss');

const Time = () => {
  const [time, setTime] = React.useState(0);
  React.useEffect(() => {
    if (time > 998) {
      return;
    }
    const timerID = setInterval(() => setTime(time+1), 1000);
    return function cleanup() {
      clearInterval(timerID);
    };
  });
  return (
    <div className={styles.sides}>{`${time}`.padStart(3, '0')}</div>
  );
};

export default Time;
