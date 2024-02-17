/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Button, message, Modal, Radio, Space } from 'antd';

import dayjs from 'dayjs';
import useWindowSize from '../../../../hooks/useWindowSize';

import FileListCom from '../../../../components/FileList';
import CategorySetCom from '../../../../components/CategorySet';
import TagSetCom from '../../../../components/TagSet';
import AddressSetCom from '../../../../components/AddressSet';
import TimeSetCom from '../../../../components/TimeSet';

import styles from './index.module.less';

// const ReactQuill =
//   typeof window === 'object' ? require('react-quill') : () => false;

type Iprops = {
  activeItem: any;
  changeActiveItem: (val: any) => void;
  changeDataSource: (
    type: 'more' | 'new' | 'save' | 'rename',
    data?: any,
  ) => void;
};

export default function MyEdit(props: Iprops) {
  const { activeItem, changeActiveItem, changeDataSource } = props;

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [category, setCategory] = useState<string>(activeItem.category);
  const [tag, setTag] = useState<any[]>(activeItem.tag);
  const [address, setAddress] = useState<string>(activeItem.address);
  const [time, setTime] = useState<any>(activeItem.createTime);
  const [fileTimeList, setFileTimeList] = useState<any[]>([]);
  const [chooseFileTimeModal, setChooseFileTimeModal] =
    useState<boolean>(false);

  const { windowHeight } = useWindowSize();

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
        oldCreateTime: activeItem.createTime,
        createTime: time,
        tag,
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
    const fileTimeArr = resp?.map((item: any) =>
      dayjs(item.createTime).valueOf(),
    );

    const data =
      resp?.map((item: any, index: number) => {
        return {
          name: item.parseUrl.base,
          base: item.parseUrl.name,
          type: item.parseUrl.ext === '.mp4' ? 'video' : 'img',
          ext: item.parseUrl.ext,
          url: item.url,
          order: fileList.length + index + 1,
        };
      }) || [];
    if (fileTimeArr && fileTimeArr.length !== 0) {
      setChooseFileTimeModal(true);
    }
    setFileTimeList(fileTimeArr);
    setFileList([...fileList, ...data]);
  };

  useEffect(() => {
    setValue(activeItem?.content);
    setFileList(activeItem?.fileList ? JSON.parse(activeItem?.fileList) : []);
    setTag(activeItem?.tag ? JSON.parse(activeItem?.tag) : []);
    setAddress(activeItem?.address);
    setTime(activeItem?.createTime);
    if (activeItem?.category) {
      setCategory(activeItem?.category);
    } else {
      setCategory(localStorage.getItem('curCategory') || '');
    }
  }, [activeItem]);

  return (
    <div
      className={styles.eidtContainer}
      style={{
        height: `${windowHeight === 0 ? 200 : windowHeight - 50}px`,
        overflow: 'auto',
      }}
    >
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
          选择文件
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
            width: '500px',
            // height: '300px',
            resize: 'none',
            maxHeight: '300px',
            overflow: 'auto',
            borderRadius: '5px',
          }}
          onChange={setValue}
        />
      </div>
      <CategorySetCom
        style={{ fontSize: '12px' }}
        category={category}
        changeCategory={(val) => setCategory(val)}
      />
      <TagSetCom
        style={{ fontSize: '12px' }}
        tag={tag}
        changeTag={(val) => {
          setTag(val);
        }}
      />
      <AddressSetCom
        style={{ fontSize: '12px' }}
        address={address}
        changeAddress={(val) => setAddress(val)}
      />
      <TimeSetCom
        style={{ fontSize: '12px', position: 'relative', top: '-5px' }}
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

      <Modal
        title="选择媒体文件的时间"
        open={chooseFileTimeModal}
        width={400}
        onOk={() => {
          setChooseFileTimeModal(false);
        }}
        onCancel={() => setChooseFileTimeModal(false)}
      >
        <Radio.Group
          onChange={(e: any) => {
            setTime(e.target.value);
          }}
          value={time}
        >
          <Space direction="vertical">
            {fileTimeList?.map((item: any) => {
              return (
                <Radio value={item} key={item}>
                  {dayjs(item).format('YYYY-MM-DD HH:mm:ss')}
                </Radio>
              );
            })}
          </Space>
        </Radio.Group>
      </Modal>
    </div>
  );
}
