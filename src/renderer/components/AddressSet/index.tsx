/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from 'react';

import { Form, Table, Modal, Button, Select, Input, message } from 'antd';
import {
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import styles from './index.module.less';

type Iprops = {
  address: string;
  changeAddress: (val: string) => void;
  style: any;
};

export default function HeaderCom(props: Iprops) {
  const { style, address, changeAddress } = props;

  const [showAddressSetModal, setShowAddressSetModal] = useState(false);
  const [showAddressChooseModal, setShowAddressChooseModal] = useState(false);
  const [addressOption, setAddressOption] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [editRecord, setEditRecord] = useState<any>({});
  const [tableData, setTableData] = useState<any[]>([]);

  const [addForm] = Form.useForm();
  const [chooseForm] = Form.useForm();

  const getAddress = async () => {
    setLoading(true);
    const resp = await window.electron.ipcRenderer.invoke('get-address', {});
    const opt = resp.data?.map((item: any) => {
      return {
        label: item.content,
        value: item.content,
      };
    });
    setAddressOption(opt);
    setTableData(resp.data);
    setLoading(false);
  };

  const addAddress = async () => {
    const values = addForm.getFieldsValue();
    const resp = await window.electron.ipcRenderer.invoke('add-address', {
      ...values,
    });
    if (resp.code === 200) {
      message.success('新增成功');
      getAddress();
      setModalType('');
      addForm.resetFields();
    } else {
      message.error(resp.msg);
    }
  };

  const updateAddress = async () => {
    const values = addForm.getFieldsValue();
    const resp = await window.electron.ipcRenderer.invoke('update-address', {
      ...values,
      id: editRecord.id,
    });
    if (resp.code === 200) {
      message.success('更新成功');
      getAddress();
      setModalType('');
      addForm.resetFields();
    } else {
      message.error(resp.msg);
    }
  };

  const deleteAddress = async (id: number) => {
    const resp = await window.electron.ipcRenderer.invoke('delete-address', {
      id,
    });
    if (resp.code === 200) {
      message.success('删除成功');
      getAddress();
    } else {
      message.error(resp.msg);
    }
  };

  useEffect(() => {
    getAddress();
  }, []);

  const columns: any[] = [
    {
      title: '地址',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      align: 'center',
    },
    {
      title: '操作',
      key: 'operate',
      width: 150,
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
                title: '确定要删除这个地址么？',
                icon: <ExclamationCircleFilled />,
                content: '请注意，这是危险操作！',
                okText: '确认',
                okType: 'danger',
                okButtonProps: {
                  type: 'primary',
                },
                cancelText: '取消',
                onOk() {
                  deleteAddress(record.id);
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
    <div className={styles.addressContainer} style={style}>
      <span onClick={() => setShowAddressSetModal(true)}>地址</span>
      <ExclamationCircleOutlined
        style={{
          color: '#1e90ff',
          position: 'relative',
          top: '0.5px',
          marginLeft: '2px',
          marginRight: '2px',
          cursor: 'pointer',
        }}
        title="选择常用地址"
        onClick={() => setShowAddressChooseModal(true)}
      />
      ：
      <div className={styles.input}>
        <Input
          placeholder="address"
          variant="borderless"
          value={address}
          onChange={(e: any) => {
            changeAddress(e.target.value);
          }}
        />
      </div>
      <Modal
        title="常用地址设置"
        open={showAddressSetModal}
        width={750}
        okText="确定"
        cancelText="取消"
        onOk={() => {
          setShowAddressSetModal(false);
        }}
        onCancel={() => setShowAddressSetModal(false)}
      >
        <div className={styles.topbar}>
          <Button
            type="primary"
            style={{
              marginBottom: '10px',
            }}
            onClick={() => setModalType('add')}
          >
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
          title={modalType === 'add' ? '新增地址' : '编辑地址'}
          open={modalType !== ''}
          width={600}
          onOk={() => {
            if (modalType === 'add') {
              addAddress();
            } else {
              updateAddress();
            }
          }}
          onCancel={() => {
            setModalType('');
            addForm.resetFields();
          }}
        >
          <Form
            name="add"
            form={addForm}
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
            initialValues={editRecord}
            style={{ maxWidth: 600 }}
            autoComplete="off"
          >
            <Form.Item
              label="地址"
              name="content"
              rules={[{ required: true, message: '请输入' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Modal>
      <Modal
        title="常用地址选择"
        open={showAddressChooseModal}
        width={400}
        onOk={() => {
          const formVal = chooseForm.getFieldsValue();
          changeAddress(formVal.content);
          setShowAddressChooseModal(false);
        }}
        onCancel={() => setShowAddressChooseModal(false)}
      >
        <Form
          name="choose"
          form={chooseForm}
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
            label="地址"
            name="content"
            rules={[{ required: true, message: '请输入' }]}
          >
            <Select style={{ width: 200 }} options={addressOption} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
