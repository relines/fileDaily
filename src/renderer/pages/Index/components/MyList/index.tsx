import React, { useState, useImperativeHandle } from 'react';

import { Input, Dropdown, Tag, Form } from 'antd';
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
  form: any;
  activeItem: any;
  changeActiveItem: any;
  changeDataSource: (
    type: 'more' | 'new' | 'save' | 'delete' | 'rename',
    data?: any,
  ) => void;
  queryCalendarInfo: () => void;
};

function MyList(props: Iprops, ref: any) {
  const {
    dataSource,
    total,
    form,
    activeItem,
    changeActiveItem,
    changeDataSource,
    queryCalendarInfo,
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
      category: '全部',
      tag: '',
      createTime: new Date().getTime(),
    });
    changeActiveItem(resp.data);
    setLoading(false);
    changeDataSource('new');
  };

  const handleDelete = async (val: any) => {
    if (val.category !== '回收站') {
      const result = await window.electron.ipcRenderer.invoke('update-data', {
        data: {
          code: val.code,
          content: val.content,
          fileList: JSON.parse(val.fileList),
          category: '回收站',
          address: val.address,
          oldCreateTime: activeItem.createTime,
          createTime: val.createTime,
          tag: val.tag ? JSON.parse(val.tag) : [],
        },
        categoryChanged: true,
        oriCategory: val.category,
      });
      changeDataSource('delete', result?.data);
    } else {
      await window.electron.ipcRenderer.invoke('delete-data', {
        code: val.code,
        createTime: val.createTime,
        fileList: JSON.parse(val.fileList),
      });
      changeDataSource('delete', val);
    }
    if (activeItem.code === val.code) {
      changeActiveItem({});
    }
  };

  useImperativeHandle(ref, () => ({
    queryCalendarInfo,
  }));

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
        <Form
          name="add"
          form={form}
          autoComplete="off"
          style={{
            width: 200,
            height: '20px',
            marginTop: '-3px',
            float: 'right',
          }}
        >
          <Form.Item name="search">
            <Input.Search
              placeholder="input search text"
              allowClear
              size="small"
              onSearch={(val, e, info) => {
                if (info?.source === 'clear') return;
                changeDataSource('new');
              }}
            />
          </Form.Item>
        </Form>
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
                            height: '15px',
                            lineHeight: '15px',
                            textAlign: 'center',
                            color: '#f00',
                          }}
                          onClick={() => {
                            handleDelete(item);
                          }}
                        >
                          {item.category === '回收站' ? '彻底删除' : '删除'}
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
                      {dayjs(item.createTime).format('M')}月
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
                  queryCalendarInfo={queryCalendarInfo}
                />

                <div className={styles.tagContainer}>
                  {item.tag &&
                    item.tag !== '"[]"' &&
                    JSON.parse(item.tag)?.map((item2: any) => {
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

export default React.forwardRef(MyList);
