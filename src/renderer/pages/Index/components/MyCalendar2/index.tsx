import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

import { message } from 'antd';

import dayjs, { Dayjs } from 'dayjs';
import { debounce } from 'lodash-es';
import { getDaysOfMonth, getWeek } from './utils';
import 'dayjs/locale/zh-cn';

import useWindowSize from '../../../../hooks/useWindowSize';

import styles from './index.module.less';

dayjs.locale('zh-cn');

type Iprops = {
  searchTime: any;
  changeSearchTime: (val: any) => void;
};

export default function ScrollCalendar(props: Iprops) {
  const { searchTime, changeSearchTime } = props;

  const [fileList, setFileList] = useState<any[]>([]);

  const calendarRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<any>({});

  const { windowHeight } = useWindowSize();

  const [messageApi, contextHolder] = message.useMessage();

  const getDays = useCallback((month: Dayjs) => {
    return getDaysOfMonth(month.year(), month.month() + 1);
  }, []);

  const [schedules, setSchedules] = useState(() => {
    return [dayjs(), dayjs().add(1, 'month'), dayjs().add(2, 'month')].map(
      (month) => ({
        month,
        days: getDays(month),
        url: '',
      }),
    );
  });

  const getCalendarInfo = async (month: any) => {
    const resp = await window.electron.ipcRenderer.invoke('get-calendar', {
      month,
    });
    if (resp.code === 200) {
      setFileList(resp.data);
    } else {
      messageApi.open({
        type: 'error',
        content: resp.msg,
      });
    }
  };

  useEffect(() => {
    getCalendarInfo(
      schedules.map((item: any) => dayjs(item.month).format('YYYY-MM')),
    );
  }, [schedules]);

  const backToday = () => {
    const arr = [dayjs(), dayjs().add(1, 'month'), dayjs().add(2, 'month')].map(
      (month) => ({
        month,
        days: getDays(month),
        url: '',
      }),
    );
    setSchedules(arr);
    changeSearchTime(dayjs(new Date()).endOf('day').valueOf());
    calendarRef.current?.scrollTo({ top: 1 });
  };

  const weekTitles = useMemo(() => {
    return [...Array(7)].map((_, weekInx) => {
      return dayjs().day(weekInx);
    });
  }, []);

  const scrollData = () => {
    let prevScrollHeight = 0;
    const scrollEvent = debounce(async (e: any) => {
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
            url: '',
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
            url: '',
          };
          return [...schedule, nextSchedule];
        });
      }
    }, 1000);

    calendarRef.current?.addEventListener('scroll', scrollEvent);
  };

  useEffect(() => {
    scrollData();
  }, []);

  return (
    <div className={styles.myCalendar}>
      {contextHolder}
      {/* header */}
      <div className={styles.calendarHeader}>
        <span>
          {dayjs(searchTime).format('YYYY年MM月DD日')} {getWeek(searchTime)}
        </span>
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
                {schedule.days.map((item2: any, index2: number) => {
                  const fileInfo = fileList.filter(
                    (item3: any) =>
                      item3.date === dayjs(item2).format('YYYY-MM-DD'),
                  )[0];
                  return (
                    <div
                      key={index2}
                      className={`${styles.calendarDay} ${
                        dayjs(item2).format('YYYYMMDD') ===
                          dayjs(new Date()).format('YYYYMMDD') && styles.toDay
                      } ${
                        dayjs(item2).format('YYYYMMDD') ===
                          dayjs(searchTime).format('YYYYMMDD') &&
                        styles.clickDay
                      }`}
                      onClick={() => {
                        if (!item2) return;
                        changeSearchTime(dayjs(item2).endOf('day').valueOf());
                      }}
                    >
                      <span>{item2 ? item2.format('DD') : ''}</span>
                      {fileInfo && fileInfo.type === 'img' && (
                        <div className={styles.imgContainer}>
                          <img
                            src={`atom:/${fileInfo.url}`}
                            alt={fileInfo.url}
                            ref={(r: any) => {
                              fileRef.current[`${fileInfo.id}_${index}`] = r;
                            }}
                            onLoad={(e: any) => {
                              if (e.target.width > e.target.height) {
                                fileRef.current[
                                  `${fileInfo.id}_${index}`
                                ].style.width = 'auto';
                                fileRef.current[
                                  `${fileInfo.id}_${index}`
                                ].style.height = '100%';
                              } else {
                                fileRef.current[
                                  `${fileInfo.id}_${index}`
                                ].style.width = '100%';
                                fileRef.current[
                                  `${fileInfo.id}_${index}`
                                ].style.height = 'auto';
                              }
                            }}
                          />
                        </div>
                      )}
                      {fileInfo && fileInfo.type === 'video' && (
                        <video
                          loop
                          muted
                          className={styles.videoContainer}
                          ref={(r: any) => {
                            fileRef.current[`${fileInfo.id}_${index}`] = r;
                          }}
                          onCanPlay={(e: any) => {
                            if (e.target.videoWidth > e.target.videoHeight) {
                              fileRef.current[
                                `${fileInfo.id}_${index}`
                              ].style.width = 'auto';
                              fileRef.current[
                                `${fileInfo.id}_${index}`
                              ].style.height = '100%';
                            } else {
                              fileRef.current[
                                `${fileInfo.id}_${index}`
                              ].style.width = '100%';
                              fileRef.current[
                                `${fileInfo.id}_${index}`
                              ].style.height = 'auto';
                            }
                          }}
                        >
                          <source
                            src={`atom:/${fileInfo.url}`}
                            type="video/mp4"
                          />
                        </video>
                      )}
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
