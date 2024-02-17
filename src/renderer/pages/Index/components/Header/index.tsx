/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from 'react';

import { Dropdown, Tooltip } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';

import useWindowSize from '../../../../hooks/useWindowSize';
import CategorySetCom from '../../../../components/CategorySet';
import { setUpTheme } from '../../../../theme';

import styles from './index.module.less';

type Iprops = {
  showCalendar: boolean;
  changeShowCalendar: (val: any) => void;
  changeCategory: (val: any) => void;
};

export default function HeaderCom(props: Iprops) {
  const { showCalendar, changeShowCalendar, changeCategory } = props;

  const [isFullScreen, setIsFullScreen] = useState<any>(false);
  const [category, setCategory] = useState<any>('all');
  const [theme, setTheme] = useState<any>('light');

  const workSpace = window.electron.ipcRenderer.getStoreValue('workSpace');
  const { windowWidth } = useWindowSize();

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
              key: 'calendar',
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
            {
              key: 'theme',
              label: (
                <div
                  onClick={() => {
                    if (theme === 'dark') {
                      setUpTheme('light');
                      setTheme('light');
                    } else {
                      setUpTheme('dark');
                      setTheme('dark');
                    }
                  }}
                >
                  {theme === 'dark' ? 'light' : 'dark'}
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
          style={{
            width: `${windowWidth - 300}px`,
          }}
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
        changeCategory={(val) => {
          changeCategory(val);
          setCategory(val);
        }}
      />
    </div>
  );
}
