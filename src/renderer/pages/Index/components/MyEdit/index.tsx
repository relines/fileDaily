/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Button, message } from 'antd';

import styles from './index.module.less';

// const ReactQuill =
//   typeof window === 'object' ? require('react-quill') : () => false;

type Iprops = {
  activeItem: any;
  changeDataSource: (type: 'more' | 'new' | 'save', data?: any) => void;
};

export default function Index(props: Iprops) {
  const { activeItem, changeDataSource } = props;
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

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
  useEffect(() => {
    setValue(activeItem?.content);
  }, [activeItem]);

  return (
    <div className={styles.container}>
      <Button
        type="primary"
        loading={loading}
        onClick={() => {
          updateData();
        }}
      >
        save
      </Button>

      <ReactQuill
        theme="snow"
        ref={quillRef}
        value={value}
        modules={
          {
            // toolbar: [[{ color: [] }, { background: [] }]],
          }
        }
        style={{
          // width: '608px',
          height: '160px',
          resize: 'none',
          borderRadius: '5px',
          marginBottom: '5px',
        }}
        onChange={setValue}
      />
    </div>
  );
}
