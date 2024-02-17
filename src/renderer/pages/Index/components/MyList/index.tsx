import React, { useEffect, useState } from 'react';

import { Input, Dropdown, message, Tag } from 'antd';
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
  keyword: string;
  changeKeyword: (val: string) => void;
  activeItem: any;
  changeActiveItem: any;
  changeDataSource: (
    type: 'more' | 'new' | 'save' | 'rename',
    data?: any,
  ) => void;
};

export default function MyList(props: Iprops) {
  const {
    dataSource,
    total,
    keyword,
    changeKeyword,
    activeItem,
    changeActiveItem,
    changeDataSource,
  } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const { windowHeight } = useWindowSize();

  const ContainerHeight = windowHeight === 0 ? 200 : windowHeight - 73;

  const addData = async () => {
    if (
      ['', '<p><br></p>'].includes(dataSource[0]?.content) &&
      [null, '[]'].includes(dataSource[0]?.fileList)
    ) {
      return;
    }
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
      fileList: JSON.parse(val.fileList),
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
        <span
          style={{
            userSelect: 'none',
          }}
        >
          共{total}条
        </span>
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
        loader={<div className={styles.listLoading}>loading...</div>}
        height={ContainerHeight}
        className={styles.scrollContainer}
        endMessage={
          <div className={styles.listBottom}>学到的知识越多，遗憾就越少</div>
        }
      >
        {dataSource.map((item: any, index: number) => {
          return (
            <div key={item.code} className={styles.listItem}>
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
                  className={styles.timeLine}
                  onClick={() => {
                    if (activeItem.code && activeItem.code === item.code) {
                      changeActiveItem({});
                    } else {
                      changeActiveItem(item);
                    }
                  }}
                >
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
              </Dropdown>

              <div className={styles.circlePoint} />
              <div
                className={`${styles.content} ${
                  activeItem?.code === item.code && styles.activedContent
                }`}
              >
                <div className={styles.text}>
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
                      padding: '5px',
                      overflow: 'hidden',
                    }}
                  />
                </div>

                <FileListShowCom
                  dataSource={item}
                  changeDataSource={changeDataSource}
                />

                <div className={styles.tagContainer}>
                  {JSON.parse(item.tag)?.map((item2: any) => {
                    return (
                      <Tag
                        key={item2.id}
                        color={item2.color}
                        bordered={false}
                        className={styles.tag}
                      >
                        {item2.value}
                      </Tag>
                    );
                  })}
                </div>

                <div className={styles.bottom}>
                  <span className={styles.time}>
                    {dataSource.length - index}
                    <span
                      style={{
                        position: 'relative',
                        top: '-1px',
                      }}
                    >
                      {' --> '}
                    </span>
                    {dayjs(item.createTime).format('YYYY年MM月DD日 HH:mm:ss')}
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
