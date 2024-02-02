/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Button, message } from 'antd';

import FileListCom from '../../../../components/FileList';
import CategorySetCom from '../../../../components/CategorySet';
import AddressSetCom from '../../../../components/AddressSet';
import TimeSetCom from '../../../../components/TimeSet';

import styles from './index.module.less';

// const ReactQuill =
//   typeof window === 'object' ? require('react-quill') : () => false;

type Iprops = {
  activeItem: any;
  changeActiveItem: (val: any) => void;
  changeDataSource: (type: 'more' | 'new' | 'save', data?: any) => void;
};

export default function MyEdit(props: Iprops) {
  const { activeItem, changeActiveItem, changeDataSource } = props;

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [category, setCategory] = useState<string>(activeItem.category);
  const [address, setAddress] = useState<string>(activeItem.address);
  const [time, setTime] = useState<string>(activeItem.createTime);

  console.log(333, activeItem);

  const quillRef = useRef<any>();

  const updateData = async () => {
    if (!category) {
      message.error('请先选择分类');
      return;
    }
    setLoading(true);
    const result = await window.electron.ipcRenderer.invoke('update-data', {
      data: {
        code: activeItem.code,
        content: value,
        fileList,
        category,
        address,
        createTime: time,
        tag: 'default',
      },
      categoryChanged: activeItem.category && category !== activeItem.category,
      oriCategory: activeItem.category,
    });
    setLoading(false);
    message.success('保存成功');
    changeDataSource('save', result?.data);
    changeActiveItem(result?.data);
  };

  const chooseFile = async () => {
    const resp = await window.electron.ipcRenderer.invoke('choose-file', {});
    const data =
      resp?.map((item: any, index: number) => {
        return {
          name: item.parseUrl.base,
          type: item.parseUrl.ext === '.mp4' ? 'video' : 'img',
          url: item.url,
          order: index + 1,
        };
      }) || [];
    setFileList([...fileList, ...data]);
  };

  useEffect(() => {
    setValue(activeItem?.content);
    setFileList(activeItem?.fileList ? JSON.parse(activeItem?.fileList) : []);
    setAddress(activeItem?.address);
    setCategory(activeItem?.category);
    setTime(activeItem?.createTime);
    if (!activeItem?.category) {
      console.log(333, localStorage.getItem('curCategory') || '')
      setCategory(localStorage.getItem('curCategory') || '');
    }
  }, [activeItem]);

  return (
    <div className={styles.eidtContainer}>
      <div
        style={{
          marginBottom: '10px',
        }}
      >
        <Button
          type="primary"
          loading={loading}
          style={{
            marginRight: '10px',
          }}
          onClick={() => {
            chooseFile();
          }}
        >
          选择图片
        </Button>
        <Button
          type="default"
          loading={loading}
          style={{
            float: 'right',
          }}
          onClick={() => {
            changeActiveItem({});
          }}
        >
          取消
        </Button>
        <Button
          type="primary"
          loading={loading}
          style={{
            float: 'right',
            marginRight: '10px',
          }}
          onClick={() => {
            updateData();
          }}
        >
          保存
        </Button>
      </div>
      <div className={styles.editor}>
        <ReactQuill
          theme="snow"
          ref={quillRef}
          value={value}
          modules={
            {
              // toolbar: [[{ color: [] }, { background: [] }]],
            }
          }
          // className="ql-editor"
          style={{
            width: '404px',
            height: '160px',
            resize: 'none',
            borderRadius: '5px',
            marginBottom: '5px',
          }}
          onChange={setValue}
        />
      </div>
      <CategorySetCom
        style={{ fontSize: '12px' }}
        category={category}
        changeCategory={(val) => setCategory(val)}
      />
      <AddressSetCom
        style={{ fontSize: '12px' }}
        address={address}
        changeAddress={(val) => setAddress(val)}
      />
      <TimeSetCom
        style={{ fontSize: '12px' }}
        time={time}
        changeTime={(val) => setTime(val)}
      />
      <FileListCom
        dataSource={fileList}
        changeDataSource={(val: any) => {
          setFileList(val);
        }}
        activeItem={activeItem}
      />
    </div>
  );
}
