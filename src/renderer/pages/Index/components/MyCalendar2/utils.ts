/* eslint-disable import/prefer-default-export */
import dayjs from 'dayjs';

export const getDaysOfMonth = (year: number, month: number) => {
  let firstDayOfMonth = dayjs(`${year}-${month}-1`);
  let lastDayOfMonth = dayjs(`${year}-${month + 1}-1`).subtract(1, 'day');
  // 开始补全第一天前的日期
  while (firstDayOfMonth.day() !== 0) {
    firstDayOfMonth = firstDayOfMonth.subtract(1, 'day');
  }

  // 开始补全最后一天后的日期
  while (lastDayOfMonth.day() !== 6) {
    lastDayOfMonth = lastDayOfMonth.add(1, 'day');
  }

  const days = [];
  const currentMonth = dayjs(`${year}-${month}-1`);
  let tempDate = firstDayOfMonth;
  while (tempDate.isBefore(lastDayOfMonth) || tempDate.isSame(lastDayOfMonth)) {
    if (tempDate.isSame(currentMonth, 'month')) {
      days.push(tempDate);
    } else {
      days.push(null);
    }

    tempDate = tempDate.add(1, 'day');
  }

  return days;
};

export const getWeek = (val: any) => {
  const datas = dayjs(val).day();
  const week = ['日', '一', '二', '三', '四', '五', '六'];
  return `星期${week[datas]}`;
};
