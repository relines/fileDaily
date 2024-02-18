import React, { useState, useEffect, useRef } from 'react';

import { message } from 'antd';

import HeaderCom from './components/Header';
import MyCalendar from './components/MyCalendar2';
import MyList from './components/MyList';
import MyEdit from './components/MyEdit';

import useWindowSize from '../../hooks/useWindowSize';

import styles from './index.module.less';

export default function IndexCom() {
  const [activeItem, setActiveItem] = useState<any>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>('');
  const [category, setCategory] = useState<string>('全部');
  const [searchTime, setSearchTime] = useState<any>();

  const pageIndexRef = useRef<number>(0);
  const calendarRef = useRef<any>();

  const { windowWidth, windowHeight } = useWindowSize();

  useEffect(() => {
    if (!activeItem) return;
    if (windowWidth === 0 || windowHeight === 0) return;

    if (showCalendar && activeItem.code) {
      window.electron.ipcRenderer.send('change-window-size', {
        width: 1270,
        height: windowHeight + 28,
      });
    }
    if (showCalendar && !activeItem.code) {
      window.electron.ipcRenderer.send('change-window-size', {
        width: 750,
        height: windowHeight + 28,
      });
    }
    if (!showCalendar && activeItem.code) {
      window.electron.ipcRenderer.send('change-window-size', {
        width: 810,
        height: windowHeight + 28,
      });
    }
    if (!showCalendar && !activeItem.code) {
      window.electron.ipcRenderer.send('change-window-size', {
        width: 300,
        height: windowHeight + 28,
      });
    }
  }, [activeItem, showCalendar]);

  const getData = async () => {
    const result = await window.electron.ipcRenderer.invoke('get-list', {
      pageIndex: pageIndexRef.current,
      category,
      keyword,
      searchTime,
    });
    setTotal(result?.total);
    return result;
  };

  const changeDataSource = async (
    type: 'more' | 'new' | 'save' | 'rename',
    data?: any,
  ) => {
    // more: 下拉刷新, pageIndex += 1,然后获取tableData；
    // new: 新建日记，pageIndex = 0,然后获取tableData；
    // save: 保存日记，用data替换tableData中修改的数据；
    if (type === 'more') {
      pageIndexRef.current += 1;
      const result = await getData();
      if (result.data?.length) {
        setTableData(tableData.concat(result.data));
      }
    }
    if (type === 'new') {
      pageIndexRef.current = 0;
      const result = await getData();
      setTableData(result.data);
      if (!result.data?.length) {
        setTableData(result.data);
        message.warning('暂无数据');
      }
      calendarRef.current?.queryCalendarInfo();
    }
    if (type === 'save') {
      const newData = tableData.map((item: any) => {
        if (item.code === data?.code) {
          return data;
        }
        return item;
      });
      setTableData(newData);
      setActiveItem(data);
      calendarRef.current?.queryCalendarInfo();
    }
    if (type === 'rename') {
      const newData = tableData.map((item: any) => {
        if (item.code === data?.code) {
          return data;
        }
        return item;
      });
      setTableData(newData);
      calendarRef.current?.queryCalendarInfo();
    }
  };

  useEffect(() => {
    if (category) {
      changeDataSource('new');
    }
  }, [category]);

  useEffect(() => {
    changeDataSource('new');
  }, [searchTime]);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <HeaderCom
          showCalendar={showCalendar}
          changeShowCalendar={(val: any) => {
            setShowCalendar(val);
            if (val) {
              setTimeout(() => {
                calendarRef.current?.queryCalendarInfo();
              }, 1000);
            }
          }}
          changeCategory={(val: any) => {
            setCategory(val);
          }}
        />
      </div>
      {showCalendar && (
        <div className={`${styles.calendarContainer}`}>
          <MyCalendar
            searchTime={searchTime}
            changeSearchTime={setSearchTime}
            ref={calendarRef}
          />
        </div>
      )}
      <div className={`${styles.listContainer}`}>
        <MyList
          dataSource={tableData}
          total={total}
          keyword={keyword}
          changeKeyword={setKeyword}
          activeItem={activeItem}
          changeActiveItem={setActiveItem}
          changeDataSource={changeDataSource}
          queryCalendarInfo={() => {
            calendarRef.current?.queryCalendarInfo();
          }}
        />
      </div>
      {activeItem?.code && (
        <div className={`${styles.editContainer}`}>
          <MyEdit
            activeItem={activeItem}
            changeActiveItem={setActiveItem}
            changeDataSource={changeDataSource}
          />
        </div>
      )}
      <div className={`${styles.bottom}`}> </div>
    </div>
  );
}
