/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import React, { useState } from 'react';

import { List, Image } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import VirtualList from 'rc-virtual-list';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dayjs from 'dayjs';

import styles from './index.module.less';

require('dayjs/locale/zh-cn');

const ContainerHeight = 500;

type Iprops = {
  dataSource: any[];
  total: number;
  isLast: boolean;
  activeItem: any;
  changeActiveItem: any;
  changeDataSource: (type: 'more' | 'new' | 'save', data?: any) => void;
};

export default function Index(props: Iprops) {
  const {
    dataSource,
    total,
    isLast,
    activeItem,
    changeActiveItem,
    changeDataSource,
  } = props;

  const [loading, setLoading] = useState<boolean>(false);
  const [isBottom, setIsBottom] = useState<boolean>(false);

  const addData = async () => {
    changeActiveItem();
    setLoading(true);
    await window.electron.ipcRenderer.invoke('add-data', {
      content: '',
      category: localStorage.getItem('category_current'),
      tag: 'default',
    });
    setLoading(false);
    changeDataSource('new');
  };

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    setIsBottom(false);
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      ContainerHeight
    ) {
      changeDataSource('more');
      setIsBottom(true);
    }
  };

  return (
    <div className={styles.listContainer}>
      <List split={false}>
        <div className={styles.header}>
          <span>共{total}条</span>
          <PlusCircleOutlined
            disabled={loading}
            style={{
              float: 'right',
              cursor: 'pointer',
              marginTop: '3px',
            }}
            onClick={() => addData()}
          />
        </div>
        <div className={styles.liner}> </div>
        <VirtualList
          data={dataSource}
          height={ContainerHeight}
          itemHeight={50}
          itemKey="code"
          onScroll={onScroll}
        >
          {(item: any) => (
            <List.Item key={item.code} className={styles.listItem}>
              <div className={styles.timeLine}>
                <div className={styles.left}>
                  {dayjs(item.createTime).format('DD')}
                </div>
                <div className={styles.right}>
                  <div className={styles.month}>
                    {dayjs(item.createTime).format('MM')}月
                  </div>
                  <div className={styles.week}>
                    {dayjs(item.createTime).locale('zh-cn').format('dddd')}
                  </div>
                </div>
              </div>
              <div className={styles.circlePoint} />
              <div
                className={`${styles.content} ${
                  activeItem?.code === item.code && styles.activedContent
                }`}
              >
                {/* <div className={styles.text}>{item.content}</div> */}
                <div
                  className={styles.text}
                  onClick={() => {
                    changeActiveItem(item);
                  }}
                >
                  <ReactQuill
                    theme="snow"
                    value={item.content}
                    modules={{
                      toolbar: null,
                    }}
                    readOnly
                    style={{
                      maxHeight: '186px',
                      overflow: 'hidden',
                    }}
                  />
                </div>

                <div className={styles.imgList}>
                  <div
                    className={styles.imgItem}
                    onClick={() => {
                      window.electron.ipcRenderer.send('open-view-window');
                    }}
                  >
                    <img
                      width={100}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className={styles.bottom}>
                  <span className={styles.time}>
                    {dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </div>
              </div>
            </List.Item>
          )}
        </VirtualList>
      </List>
      {isLast && isBottom && (
        <div className={styles.listBottom}>学到的知识越多，遗憾就越少</div>
      )}
    </div>
  );
}
