/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from 'react';

import { Form, Dropdown, Modal, Select } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';

import CategorySet from './components/CategorySet';

import styles from './index.module.less';

export default function HeaderCom() {
  const [isFullScreen, setIsFullScreen] = useState<any>(false);
  const [showCategorySetModal, setShowCategorySetModal] = useState(false);
  const [showCategoryChooseModal, setShowCategoryChooseModal] = useState(false);
  const [showWorkSpaceChooseModal, setShowWorkSpaceChooseModal] =
    useState(false);
  const [categoryOption, setCategoryOption] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>({});

  const [form] = Form.useForm();
  const [workSpaceForm] = Form.useForm();

  window.electron.ipcRenderer.on('mainWindowResize', (arg) => {
    setIsFullScreen(arg);
  });

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
      setCurrentCategory(cur || resp.data[0]);
      setCategoryOption(opt);
      form.setFieldsValue({
        name: cur?.name || resp.data[0]?.name,
      });
    }
  };

  const changeCurrentCategory = async () => {
    const resp = await window.electron.ipcRenderer.invoke(
      'set-category-current',
      {
        name: form.getFieldsValue()?.name,
      },
    );
    const cur: any = resp.data?.[0];
    const categoryCurrent = cur?.name;
    localStorage.setItem('category_current', categoryCurrent);
    setCurrentCategory(cur);
    setShowCategoryChooseModal(false);
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <div
      className={styles.container}
      style={
        isFullScreen
          ? {}
          : {
              marginLeft: '57px',
            }
      }
    >
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: '1',
              label: (
                <div onClick={() => setShowWorkSpaceChooseModal(true)}>
                  工作空间选择
                </div>
              ),
            },
            {
              key: '2',
              label: '分类',
              children: [
                {
                  key: '1-1',
                  label: (
                    <div onClick={() => setShowCategorySetModal(true)}>
                      设置分类
                    </div>
                  ),
                },
                {
                  key: '1-2',
                  label: (
                    <div onClick={() => setShowCategoryChooseModal(true)}>
                      选择分类
                    </div>
                  ),
                },
              ],
            },
            {
              key: '3',
              label: '标签',
              children: [
                {
                  key: '1-1',
                  label: '新建标签',
                },
                {
                  key: '1-2',
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

      <span>分类：{currentCategory.name}</span>

      <Modal
        title="分类设置"
        open={showCategorySetModal}
        width={750}
        okText="确定"
        cancelText="取消"
        onOk={() => {
          setShowCategorySetModal(false);
        }}
        onCancel={() => setShowCategorySetModal(false)}
      >
        <CategorySet />
      </Modal>
      <Modal
        title="分类选择"
        open={showCategoryChooseModal}
        width={400}
        onOk={() => {
          changeCurrentCategory();
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
      {/* <div
        onClick={async () => {
          const dirHandle = await window.showDirectoryPicker();
          console.log(333, dirHandle);
        }}
      >
        123
      </div> */}
      <Modal
        title="工作空间选择"
        open={showWorkSpaceChooseModal}
        width={400}
        onOk={() => {
          changeCurrentCategory();
        }}
        onCancel={() => setShowWorkSpaceChooseModal(false)}
      >
        <Form
          name="workSpaceChoose"
          form={workSpaceForm}
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
            <input
              type="file"
              webkitdirectory="directory"
              onChange={(e) => {
                console.log(333, e.target.files);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
