/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Form, Button, Modal, Select, message } from 'antd';

import FileListCom from '../../../../components/FileList';

import styles from './index.module.less';

// const ReactQuill =
//   typeof window === 'object' ? require('react-quill') : () => false;

type Iprops = {
  activeItem: any;
  changeActiveItem: () => void;
  changeDataSource: (type: 'more' | 'new' | 'save', data?: any) => void;
};

export default function MyEdit(props: Iprops) {
  const { activeItem, changeActiveItem, changeDataSource } = props;
  console.log(333, activeItem);

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [category, setCategory] = useState<string>(activeItem.category);
  const [categoryOption, setCategoryOption] = useState<any[]>([]);
  const [showCategoryChooseModal, setShowCategoryChooseModal] = useState(false);

  const quillRef = useRef<any>();

  const [form] = Form.useForm();

  const getCategory = async () => {
    const resp = await window.electron.ipcRenderer.invoke('get-category', {});
    const opt = resp.data?.map((item: any) => {
      return {
        label: item.name,
        value: item.name,
      };
    });
    if (resp.data.length) {
      const cur: any = resp.data.filter(
        (item: any) => item.current === '1',
      )?.[0];
      const categoryCurrent = cur ? cur?.name : resp.data[0]?.name;
      localStorage.setItem('category_current', categoryCurrent);
      setCategoryOption(opt);
      form.setFieldsValue({
        name: cur?.name || resp.data[0]?.name,
      });
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const updateData = async () => {
    if (!category) {
      message.error('请先选择分类');
      return;
    }
    setLoading(true);
    const result = await window.electron.ipcRenderer.invoke('update-data', {
      code: activeItem.code,
      content: value,
      fileList,
      currentCategory: localStorage.getItem('category_current'),
      tag: 'default',
    });
    setLoading(false);
    message.success('保存成功');
    changeDataSource('save', result?.data);
  };

  const chooseFile = async () => {
    const resp = await window.electron.ipcRenderer.invoke('choose-file', {});
    const data = resp.map((item: any, index: number) => {
      return {
        name: item.parseUrl.base,
        type: item.parseUrl.ext === '.mp4' ? 'video' : 'img',
        url: item.url,
        order: index + 1,
      };
    });
    setFileList([...fileList, ...data]);
  };
  useEffect(() => {
    setValue(activeItem?.content);
    setFileList(activeItem?.fileList ? JSON.parse(activeItem?.fileList) : []);
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
          type="primary"
          loading={loading}
          onClick={() => {
            // chooseFile();
          }}
        >
          切换分类
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
      <div
        style={{
          fontSize: '12px',
        }}
        onClick={() => setShowCategoryChooseModal(true)}
      >
        分类：{category}
      </div>

      <FileListCom
        dataSource={fileList}
        changeDataSource={(val: any) => {
          setFileList(val);
        }}
        activeItem={activeItem}
      />
      <Modal
        title="分类选择"
        open={showCategoryChooseModal}
        width={400}
        onOk={() => {
          // changeCurrentCategory();
          // setCategory()
        }}
        onCancel={() => setShowCategoryChooseModal(false)}
      >
        <Form
          name="choose"
          form={form}
          style={{
            margin: '20px 0',
          }}
          labelCol={{
            style: {
              width: '80px',
            },
          }}
          wrapperCol={{
            style: {
              width: '200px',
            },
          }}
          autoComplete="off"
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入' }]}
          >
            <Select style={{ width: 120 }} options={categoryOption} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
