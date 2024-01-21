/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-unstable-nested-components */
// 分类设置
import React, { useEffect, useState } from 'react';

import { Modal, Table, Button, Form, Input, InputNumber, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import styles from './index.module.less';

type Iprops = {};

export default function CategoryCom(props: Iprops) {
  const [loading, setLoading] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [editRecord, setEditRecord] = useState<any>({});
  const [tableData, setTableData] = useState<any[]>([]);

  const [form] = Form.useForm();

  useEffect(() => {
    if (modalType === 'edit') {
      form.setFieldsValue({
        ...editRecord,
      });
    }
  }, [modalType]);

  const getCategory = async () => {
    setLoading(true);
    const resp = await window.electron.ipcRenderer.invoke('get-category', {});
    setTableData(resp.data);
    setLoading(false);
  };

  const addCategory = async () => {
    const values = form.getFieldsValue();
    const resp = await window.electron.ipcRenderer.invoke('add-category', {
      ...values,
      current: '2', // 2 默认，1 current
    });
    if (resp.code === 200) {
      message.success('新增成功');
      getCategory();
      setModalType('');
      form.resetFields();
    } else {
      message.error(resp.msg);
    }
  };

  const updateCategory = async () => {
    const values = form.getFieldsValue();
    const resp = await window.electron.ipcRenderer.invoke('update-category', {
      ...values,
      id: editRecord.id,
    });
    if (resp.code === 200) {
      message.success('更新成功');
      getCategory();
      setModalType('');
      form.resetFields();
    } else {
      message.error(resp.msg);
    }
  };

  const deleteCategory = async (id: number) => {
    const resp = await window.electron.ipcRenderer.invoke('delete-category', {
      id,
    });
    if (resp.code === 200) {
      message.success('删除成功');
      getCategory();
    } else {
      message.error(resp.msg);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const columns: any[] = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      align: 'center',
    },
    {
      title: '日记数',
      dataIndex: 'number',
      key: 'number',
      width: 100,
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      align: 'center',
    },
    {
      title: '操作',
      key: 'operate',
      width: 100,
      align: 'center',
      render: (_: any, record: any) => (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <a
            onClick={() => {
              setModalType('edit');
              setEditRecord(record);
            }}
          >
            编辑
          </a>
          <Button
            type="link"
            disabled={tableData.length === 1}
            danger
            onClick={() => {
              Modal.confirm({
                title: '确定要删除这个分类么？',
                icon: <ExclamationCircleFilled />,
                content: '请注意，这是危险操作！',
                okText: '确认',
                okType: 'danger',
                okButtonProps: {
                  type: 'primary',
                },
                cancelText: '取消',
                onOk() {
                  deleteCategory(record.id);
                },
              });
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <Button type="primary" onClick={() => setModalType('add')}>
          新增
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tableData}
        loading={loading}
        size="small"
        bordered
        pagination={false}
      />
      <Modal
        title={modalType === 'add' ? '新增分类' : '编辑分类'}
        open={modalType !== ''}
        width={600}
        onOk={() => {
          if (modalType === 'add') {
            addCategory();
          } else {
            updateCategory();
          }
        }}
        onCancel={() => {
          setModalType('');
          form.resetFields();
        }}
      >
        <Form
          name="add"
          form={form}
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
          style={{ maxWidth: 600 }}
          autoComplete="off"
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="备注"
            name="remark"
            rules={[{ required: true, message: '请输入' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="排序"
            name="sort"
            rules={[{ required: true, message: '请输入' }]}
          >
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
