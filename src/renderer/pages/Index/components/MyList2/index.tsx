/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lonely-if */
/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import React, { useState } from 'react';

import { Input, Dropdown, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import InfiniteScroll from 'react-infinite-scroll-component';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dayjs from 'dayjs';

import FileListShowCom from '../../../../components/FileListShow';
import useWindowSize from '../../../../hooks/useWindowSize';

import styles from './index.module.less';

require('dayjs/locale/zh-cn');

type Iprops = {
  dataSource: any[];
  total: number;
  isLast: boolean;
  keyword: string;
  changeKeyword: (val: string) => void;
  activeItem: any;
  changeActiveItem: any;
  changeDataSource: (type: 'more' | 'new' | 'save', data?: any) => void;
};

export default function MyList(props: Iprops) {
  const {
    dataSource,
    total,
    isLast,
    keyword,
    changeKeyword,
    activeItem,
    changeActiveItem,
    changeDataSource,
  } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const { windowHeight } = useWindowSize();

  const ContainerHeight = windowHeight === 0 ? 200 : windowHeight - 83;

  const addData = async () => {
    setLoading(true);
    const resp = await window.electron.ipcRenderer.invoke('add-data', {
      content: '',
      tag: '',
      createTime: new Date().getTime(),
    });
    changeActiveItem(resp.data);
    setLoading(false);
    changeDataSource('new');
  };

  const handleDelete = async (val: any) => {
    await window.electron.ipcRenderer.invoke('delete-data', {
      code: val.code,
    });
    if (activeItem.code === val.code) {
      changeActiveItem({});
    }
    message.success('删除成功');
    changeDataSource('new');
  };

  return (
    <div className={styles.listContainer}>
      <div className={styles.header}>
        <span>共{total}条</span>
        <PlusCircleOutlined
          disabled={loading}
          style={{
            cursor: 'pointer',
            marginTop: '5px',
            marginLeft: '5px',
          }}
          onClick={() => addData()}
        />
        <Input.Search
          placeholder="input search text"
          allowClear
          size="small"
          value={keyword}
          onChange={(e: any) => {
            changeKeyword(e.target.value);
          }}
          onSearch={(val, e, info) => {
            if (info?.source === 'clear') return;
            changeDataSource('new');
          }}
          style={{ width: 200, height: '20px', float: 'right' }}
        />
      </div>
      <div className={styles.liner}> </div>
      <InfiniteScroll
        dataLength={dataSource.length}
        next={() => {
          changeDataSource('more');
        }}
        hasMore={dataSource.length < total}
        loader={<h4>Loading...</h4>}
        height={ContainerHeight}
        className={styles.scrollContainer}
        endMessage={
          <div className={styles.listBottom}>学到的知识越多，遗憾就越少</div>
        }
      >
        {dataSource.map((item: any, index: number) => {
          return (
            <div key={item.code} className={styles.listItem}>
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
                <Dropdown
                  menu={{
                    items: [
                      {
                        label: (
                          <div
                            style={{
                              width: '30px',
                              height: '15px',
                              lineHeight: '15px',
                              textAlign: 'center',
                            }}
                            onClick={() => {
                              changeActiveItem(item);
                            }}
                          >
                            编辑
                          </div>
                        ),
                        key: 'edit',
                      },
                      {
                        label: (
                          <div
                            style={{
                              width: '30px',
                              height: '15px',
                              lineHeight: '15px',
                              textAlign: 'center',
                              color: '#f00',
                            }}
                            onClick={() => {
                              handleDelete(item);
                            }}
                          >
                            删除
                          </div>
                        ),
                        key: 'del',
                      },
                    ],
                  }}
                  trigger={['contextMenu']}
                  key={item.code}
                >
                  <div
                    className={styles.text}
                    onClick={() => {
                      if (activeItem.code && activeItem.code === item.code) {
                        changeActiveItem({});
                      } else {
                        changeActiveItem(item);
                      }
                    }}
                  >
                    {/* <div
                      style={{
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {item.content}
                    </div> */}
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
                </Dropdown>

                <FileListShowCom
                  dataSource={item.fileList ? JSON.parse(item.fileList) : []}
                  changeDataSource={() => {}}
                />

                <div
                  className={styles.bottom}
                  onClick={() => {
                    if (activeItem.code && activeItem.code === item.code) {
                      changeActiveItem({});
                    } else {
                      changeActiveItem(item);
                    }
                  }}
                >
                  <span className={styles.time}>
                    {dataSource.length - index}
                    {'-->'}
                    {dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </InfiniteScroll>
    </div>
  );
}
