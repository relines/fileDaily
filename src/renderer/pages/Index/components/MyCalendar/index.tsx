/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import solarLunar from 'solarLunar';

import 'react-calendar/dist/Calendar.css';
import styles from './index.module.less';

function MyCalendar() {
  const [value, setVal] = useState(new Date());

  return (
    <div>
      <Calendar
        onChange={(val: any) => {
          console.log(132, val, val.getMonth() + 1);
          const solar2lunarData = solarLunar.solar2lunar(
            val.getFullYear(),
            Number(val.getMonth()) + 1,
            val.getDate(),
          );
          console.log(3, val.getFullYear(), val.getMonth() + 1, val.getDate());
          console.log(333, solar2lunarData);
          setVal(val);
        }}
        className={styles.myCalendar}
        showNeighboringMonth
        value={value}
        formatDay={(locale, date) => {
          return date.getDate().toString();
        }}
        tileClassName={({ date, view }) => {
          if (view === 'month' && date.getDay() === 3) {
            return styles.test;
          }
        }}
        tileContent={({ date, view }) => {
          // console.log(1, date, view, date.getMonth());
          const solar2lunarData = solarLunar.solar2lunar(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
          );
          return view === 'month' && date.getDay() === 4 ? (
            <div style={{ fontSize: '10px' }}>
              <div>
                {solar2lunarData.term
                  ? solar2lunarData.term
                  : solar2lunarData.dayCn}
              </div>
              <div>5</div>
            </div>
          ) : (
            <div style={{ fontSize: '10px' }}>
              <div>
                {solar2lunarData.term
                  ? solar2lunarData.term
                  : solar2lunarData.dayCn}
              </div>
              <div>0</div>
            </div>
          );
        }}
      />
    </div>
  );
}

// 让组件只在客户端渲染
export default MyCalendar;
