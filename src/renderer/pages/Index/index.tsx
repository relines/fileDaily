/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect, useRef } from 'react';

import { message } from 'antd';

import HeaderCom from './components/Header';
import MyCalendar from './components/MyCalendar';
import MyList from './components/MyList';
import MyEdit from './components/MyEdit';

import useWindowSize from '../../hooks/useWindowSize';

import styles from './index.module.less';

export default function IndexCom() {
  const [activeItem, setActiveItem] = useState<any>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLast, setIsLast] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const pageIndexRef = useRef<number>(0);

  const { windowWidth, windowHeight } = useWindowSize();

  useEffect(() => {
    console.log(1234, activeItem, windowWidth, windowHeight);
    if (!activeItem.code || windowWidth > 1000) {
      return;
    }
    // window.electron.ipcRenderer.send('change-window-size', {
    //   width: windowWidth + 500,
    //   height: windowHeight,
    // });
  }, [activeItem]);

  const getData = async () => {
    const result = await window.electron.ipcRenderer.invoke('get-list', {
      pageIndex: pageIndexRef.current,
    });
    console.log(666, result);
    setTotal(result?.total || total);
    return result;
  };

  const changeDataSource = async (
    type: 'more' | 'new' | 'save',
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
        setIsLast(false);
        message.success('+10条数据');
      } else {
        setIsLast(true);
        // message.warning('没有更多数据了');
      }
    }
    if (type === 'new') {
      pageIndexRef.current = 0;
      const result = await getData();
      setTableData(result.data);
      if (result.data?.length) {
        message.success('获取到前10条数据');
      } else {
        setTableData(result.data);
        message.warning('暂无数据');
      }
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
    }
  };

  useEffect(() => {
    changeDataSource('new');
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <HeaderCom
          showCalendar={showCalendar}
          changeShowCalendar={setShowCalendar}
        />
      </div>
      {showCalendar && (
        <div className={`${styles.content} ${styles.calendarContainer}`}>
          <MyCalendar />
        </div>
      )}
      <div className={`${styles.content} ${styles.listContainer}`}>
        <MyList
          dataSource={tableData}
          total={total}
          isLast={isLast}
          activeItem={activeItem}
          changeActiveItem={setActiveItem}
          changeDataSource={changeDataSource}
        />
      </div>
      {activeItem?.code && (
        <div className={`${styles.content} ${styles.editContainer}`}>
          <MyEdit
            activeItem={activeItem}
            changeActiveItem={setActiveItem}
            changeDataSource={changeDataSource}
          />
        </div>
      )}
    </div>
  );
}
