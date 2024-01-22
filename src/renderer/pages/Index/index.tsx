/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect, useRef } from 'react';

import { message } from 'antd';

import MyCalendar from './components/MyCalendar';
import MyList from './components/MyList';
import MyEdit from './components/MyEdit';

import styles from './index.module.less';

export default function IndexCom() {
  const [activeItem, setActiveItem] = useState({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  const pageIndexRef = useRef<number>(0);

  const getData = async () => {
    const result = await window.electron.ipcRenderer.invoke('get-list', {
      pageIndex: pageIndexRef.current,
    });
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
        message.success('+10条数据');
      } else {
        message.warning('没有更多数据了');
      }
    }
    if (type === 'new') {
      pageIndexRef.current = 0;
      const result = await getData();
      if (result.data?.length) {
        setTableData(result.data);
        message.success('获取到前10条数据');
      } else {
        message.warning('暂无数据');
      }
    }
    if (type === 'save') {
      const newData = tableData.map((item: any) => {
        if (item.code === data.code) {
          return data;
        }
        return item;
      });
      setTableData(newData);
    }
  };

  useEffect(() => {
    changeDataSource('new');
  }, []);

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${styles.calendarContainer}`}>
        <MyCalendar />
      </div>
      <div className={`${styles.content} ${styles.listContainer}`}>
        <MyList
          dataSource={tableData}
          total={total}
          activeItem={activeItem}
          changeActiveItem={setActiveItem}
          changeDataSource={changeDataSource}
        />
      </div>
      <div className={`${styles.content} ${styles.editContainer}`}>
        <MyEdit activeItem={activeItem} changeDataSource={changeDataSource} />
      </div>
    </div>
  );
}
