/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/no-array-index-key */
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { debounce } from 'lodash-es';
import { getDaysOfMonth } from './utils';
import 'dayjs/locale/zh-cn';

import useWindowSize from '../../../../hooks/useWindowSize';

import styles from './index.module.less';

dayjs.locale('zh-cn');

function ScrollCalendar() {
  const [clickDay, setClickDay] = useState<any>(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const { windowHeight } = useWindowSize();

  const getDays = useCallback((month: Dayjs) => {
    return getDaysOfMonth(month.year(), month.month() + 1);
  }, []);

  const [schedules, setSchedules] = useState(() => {
    return [dayjs(), dayjs().add(1, 'month'), dayjs().add(2, 'month')].map(
      (month) => ({
        month,
        days: getDays(month),
      }),
    );
  });

  const backToday = () => {
    const arr = [dayjs(), dayjs().add(1, 'month'), dayjs().add(2, 'month')].map(
      (month) => ({
        month,
        days: getDays(month),
      }),
    );
    setSchedules(arr);
    calendarRef.current?.scrollTo({ top: 1 });
  };

  const weekTitles = useMemo(() => {
    return [...Array(7)].map((_, weekInx) => {
      return dayjs().day(weekInx);
    });
  }, []);

  const scrollData = () => {
    let prevScrollHeight = 0;
    const scrollEvent = debounce(async (e) => {
      const scrollHeight = e.target.scrollHeight;
      const scrollTop = e.target.scrollTop;
      const offsetHeight = e.target.offsetHeight;

      if (scrollTop === 0) {
        console.log('列表置顶');
        setSchedules((schedule) => {
          const lastSchedule = schedule[0];
          const prevMonth = lastSchedule.month.subtract(1, 'month');
          const prevSchedule = {
            month: prevMonth,
            days: getDays(prevMonth),
          };
          return [prevSchedule, ...schedule];
        });
        const targetScrollTop =
          scrollTop + (scrollHeight - prevScrollHeight) + 50;
        calendarRef.current?.scrollTo({ top: targetScrollTop });

        console.log('prevScrollHeight:', prevScrollHeight);
        prevScrollHeight = scrollHeight;
      }

      if (offsetHeight + scrollTop >= scrollHeight - 10) {
        console.log('列表触底,触发接口请求数据');
        setSchedules((schedule) => {
          const lastSchedule = schedule[schedule.length - 1];
          const nextMonth = lastSchedule.month.add(1, 'month');
          const nextSchedule = {
            month: nextMonth,
            days: getDays(nextMonth),
          };
          return [...schedule, nextSchedule];
        });
      }
    }, 100);

    calendarRef.current?.addEventListener('scroll', scrollEvent);
  };

  useEffect(() => {
    scrollData();
  }, []);

  return (
    <div className={styles.myCalendar}>
      {/* header */}
      <div className={styles.calendarHeader}>
        <span>{dayjs(clickDay).format('YYYY年MM月DD日')}</span>
        <span className={styles.backToday} onClick={backToday}>
          今天
        </span>
      </div>
      <div
        className={styles.calendar}
        style={{
          height: `${windowHeight - 70}px`,
        }}
        ref={calendarRef}
      >
        {/* 星期标题 */}
        <div className={styles.calendarTitle}>
          {weekTitles.map((title, index) => {
            return (
              <div key={index} className={styles.calendarWeek}>
                {title.format('dd')}
              </div>
            );
          })}
        </div>
        {schedules.map((schedule, index) => {
          return (
            <div key={index}>
              {/* 年 月 */}
              <div className={styles.calendarMonth}>
                <div>{schedule.month.format('MMM YYYY')}</div>
              </div>

              {/* 日 */}
              <div className={styles.calendarContent}>
                {schedule.days.map((item2, index2) => {
                  return (
                    <div
                      key={index2}
                      className={`${styles.calendarDay} ${
                        dayjs(item2).format('YYYYMMDD') ===
                          dayjs(new Date()).format('YYYYMMDD') && styles.toDay
                      } ${
                        dayjs(item2).format('YYYYMMDD') ===
                          dayjs(clickDay).format('YYYYMMDD') && styles.clickDay
                      }`}
                      onClick={() => {
                        if (!item2) return;
                        setClickDay(item2);
                      }}
                    >
                      {item2 ? item2.format('DD') : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScrollCalendar;
