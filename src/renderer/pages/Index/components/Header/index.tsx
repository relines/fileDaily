/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from 'react';

import { Dropdown, Tooltip } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';

import CategorySetCom from '../../../../components/CategorySet';

import useWindowSize from '../../../../hooks/useWindowSize';

import styles from './index.module.less';

type Iprops = {
  showCalendar: boolean;
  changeShowCalendar: (val: any) => void;
};

export default function HeaderCom(props: Iprops) {
  const { showCalendar, changeShowCalendar } = props;

  const [isFullScreen, setIsFullScreen] = useState<any>(false);
  const [category, setCategory] = useState<any>('');

  const { windowWidth, windowHeight } = useWindowSize();

  useEffect(() => {
    if (windowWidth === 0 || windowHeight === 0) return;
    // if (showCalendar && windowWidth < 500) {
    //   window.electron.ipcRenderer.send('change-window-size', {
    //     width: windowWidth + 500,
    //     height: windowHeight + 26,
    //   });
    // }
    if (!showCalendar && windowWidth > 800) {
      window.electron.ipcRenderer.send('change-window-size', {
        width: windowWidth - 400,
        height: windowHeight + 30,
      });
    }
  }, [showCalendar]);

  const workSpace = window.electron.ipcRenderer.getStoreValue('workSpace');

  window.electron.ipcRenderer.on('mainWindowResize', (arg) => {
    setIsFullScreen(arg);
  });

  const chooseWorkSpace = async () => {
    const resp = await window.electron.ipcRenderer.invoke('choose-folder', {});
    if (resp) {
      localStorage.setItem('workSpace', resp);
      window.electron.ipcRenderer.send('main-window-reload');
    }
  };

  useEffect(() => {
    localStorage.setItem('curCategory', category);
  }, [category]);

  return (
    <div
      className={styles.container}
      style={
        isFullScreen
          ? {}
          : {
              // marginLeft: '57px',
            }
      }
    >
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: '3',
              label: (
                <div
                  onClick={() => {
                    changeShowCalendar(!showCalendar);
                  }}
                >
                  {showCalendar ? '隐藏日历' : '显示日历'}
                </div>
              ),
            },
          ],
        }}
      >
        <div className={styles.setup}>
          <MenuUnfoldOutlined />
        </div>
      </Dropdown>

      <span
        style={{
          fontSize: '14px',
          cursor: 'pointer',
        }}
        onClick={chooseWorkSpace}
      >
        工作空间目录：
      </span>
      <Tooltip title={workSpace}>
        <span
          className={styles.workSpace}
          onClick={() => {
            window.electron.ipcRenderer.send('open-folder', workSpace);
          }}
        >
          {workSpace}
        </span>
      </Tooltip>

      <CategorySetCom
        style={{ fontSize: '12px', float: 'right' }}
        category={category}
        changeCategory={(val) => setCategory(val)}
      />
    </div>
  );
}
