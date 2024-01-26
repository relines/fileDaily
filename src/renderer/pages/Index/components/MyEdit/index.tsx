/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Button, message } from 'antd';

import ImgListCom from '../../../../components/ImgList';

import styles from './index.module.less';

// const ReactQuill =
//   typeof window === 'object' ? require('react-quill') : () => false;

type Iprops = {
  activeItem: any;
  changeDataSource: (type: 'more' | 'new' | 'save', data?: any) => void;
};

export default function MyEdit(props: Iprops) {
  const { activeItem, changeDataSource } = props;

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [imgList, setImgList] = useState<any[]>([]);

  const quillRef = useRef<any>();

  const updateData = async () => {
    setLoading(true);
    const result = await window.electron.ipcRenderer.invoke('update-data', {
      code: activeItem.code,
      content: value,
      tag: 'default',
    });
    setLoading(false);
    message.success('保存成功');
    changeDataSource('save', result?.data);
  };

  const chooseFile = async () => {
    const resp = await window.electron.ipcRenderer.invoke('choose-file', {});
    console.log(333, resp);
    const data = resp.map((item: any) => {
      return {
        name: item.parseUrl.base,
        url: `atom:/${item.url}`,
      };
    });
    setImgList([...imgList, ...data]);
  };
  useEffect(() => {
    setValue(activeItem?.content);
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
          onClick={() => {
            updateData();
          }}
        >
          save
        </Button>
        <Button
          type="primary"
          loading={loading}
          style={{
            marginLeft: '10px',
          }}
          onClick={() => {
            // updateData();
            chooseFile();
          }}
        >
          选择图片
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
            // width: '100%',
            width: '404px',
            height: '160px',
            resize: 'none',
            borderRadius: '5px',
            marginBottom: '5px',
          }}
          onChange={setValue}
        />
      </div>

      <ImgListCom dataSource={imgList} />
    </div>
  );
}
