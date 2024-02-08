/* eslint-disable react/jsx-no-constructed-context-values */
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
  const [isLast, setIsLast] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>('');
  const [searchTime, setSearchTime] = useState<any>();

  const pageIndexRef = useRef<number>(0);

  const { windowWidth, windowHeight } = useWindowSize();

  useEffect(() => {
    if (!activeItem) return;
    if (windowWidth === 0 || windowHeight === 0) return;

    if (showCalendar && activeItem.code && windowWidth < 1270) {
      window.electron.ipcRenderer.send('change-window-size', {
        width: 1270,
        height: windowHeight + 26,
      });
    }
    if (!showCalendar && !activeItem.code && windowWidth < 300) {
      window.electron.ipcRenderer.send('change-window-size', {
        width: 300,
        height: windowHeight + 26,
      });
    }
    if (!showCalendar && activeItem.code && windowWidth < 810) {
      window.electron.ipcRenderer.send('change-window-size', {
        width: 810,
        height: windowHeight + 26,
      });
    }
    if (showCalendar && !activeItem.code && windowWidth < 750) {
      window.electron.ipcRenderer.send('change-window-size', {
        width: 750,
        height: windowHeight + 26,
      });
    }
  }, [activeItem, showCalendar]);

  // useEffect(() => {
  //   if (!activeItem) return;
  //   if (windowWidth === 0 || windowHeight === 0) return;

  //   if (showCalendar && activeItem.code && windowWidth < 1270) {
  //     window.electron.ipcRenderer.send('change-window-size', {
  //       width: 1270,
  //       height: windowHeight + 26,
  //     });
  //   }
  //   if (!showCalendar && activeItem.code && windowWidth < 810) {
  //     window.electron.ipcRenderer.send('change-window-size', {
  //       width: 810,
  //       height: windowHeight + 26,
  //     });
  //   }

  //   if (!activeItem.code && windowWidth > 800) {
  //     window.electron.ipcRenderer.send('change-window-size', {
  //       width: windowWidth - 500,
  //       height: windowHeight + 30,
  //     });
  //     return;
  //   }
  //   if (showCalendar && windowWidth < 1276) {
  //     window.electron.ipcRenderer.send('change-window-size', {
  //       width: 1276,
  //       height: windowHeight + 26,
  //     });
  //   }
  //   if (!showCalendar && windowWidth < 870) {
  //     window.electron.ipcRenderer.send('change-window-size', {
  //       width: 876,
  //       height: windowHeight + 26,
  //     });
  //   }
  //   console.log(777, showCalendar, activeItem.code, windowWidth);
  // }, [activeItem, showCalendar]);

  const getData = async () => {
    console.log(132, searchTime);
    const result = await window.electron.ipcRenderer.invoke('get-list', {
      pageIndex: pageIndexRef.current,
      keyword,
      searchTime,
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
  }, [searchTime]);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <HeaderCom
          showCalendar={showCalendar}
          changeShowCalendar={setShowCalendar}
        />
      </div>
      {showCalendar && (
        <div className={`${styles.calendarContainer}`}>
          <MyCalendar
            searchTime={searchTime}
            changeSearchTime={setSearchTime}
          />
        </div>
      )}
      <div className={`${styles.listContainer}`}>
        <MyList
          dataSource={tableData}
          total={total}
          isLast={isLast}
          keyword={keyword}
          changeKeyword={setKeyword}
          activeItem={activeItem}
          changeActiveItem={setActiveItem}
          changeDataSource={changeDataSource}
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
    </div>
  );
}
