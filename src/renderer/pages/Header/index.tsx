/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from 'react';

import { Dropdown } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';

import CategorySetCom from '../../components/CategorySet';

import styles from './index.module.less';

export default function HeaderCom() {
  const [isFullScreen, setIsFullScreen] = useState<any>(false);
  const [category, setCategory] = useState<any>('');

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
              label: '标签',
              children: [
                {
                  key: '31',
                  label: '新建标签',
                },
                {
                  key: '32',
                  label: '2nd menu item',
                },
              ],
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
      <span
        style={{
          marginRight: '10px',
          fontSize: '12px',
        }}
      >
        {workSpace}
      </span>

      <CategorySetCom
        style={{ fontSize: '14px' }}
        category={category}
        changeCategory={(val) => setCategory(val)}
      />
    </div>
  );
}
