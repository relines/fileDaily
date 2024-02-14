import React, { useState, useEffect } from 'react';

import {
  Form,
  Table,
  Modal,
  Button,
  Input,
  Checkbox,
  InputNumber,
  Tag,
  ColorPicker,
  message,
} from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import styles from './index.module.less';

type Iprops = {
  tag: any;
  changeTag: (val: any) => void;
  style: any;
};

export default function HeaderCom(props: Iprops) {
  const { style, tag, changeTag } = props;

  const [showTagSetModal, setShowTagSetModal] = useState(false);
  const [showTagChooseModal, setShowTagChooseModal] = useState(false);
  const [tagOption, setTagOption] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [editRecord, setEditRecord] = useState<any>({});
  const [tableData, setTableData] = useState<any[]>([]);

  const [addForm] = Form.useForm();

  const getTag = async () => {
    setLoading(true);
    const resp = await window.electron.ipcRenderer.invoke('get-tag', {});
    const opt = resp.data?.map((item: any) => {
      return {
        label: item.name,
        value: item.name,
        color: item.color,
        id: item.id,
        sort: item.sort,
      };
    });
    setTagOption(opt);
    setTableData(resp.data);
    setLoading(false);
  };

  const addTag = async () => {
    const values = addForm.getFieldsValue();
    const resp = await window.electron.ipcRenderer.invoke('add-tag', {
      ...values,
      color:
        typeof values.color === 'string'
          ? values.color
          : values.color?.toHexString(),
    });
    if (resp.code === 200) {
      message.success('新增成功');
      getTag();
      setModalType('');
      addForm.resetFields();
    } else {
      message.error(resp.msg);
    }
  };

  const updateTag = async () => {
    const values = addForm.getFieldsValue();
    const resp = await window.electron.ipcRenderer.invoke('update-tag', {
      ...values,
      id: editRecord.id,
      color:
        typeof values.color === 'string'
          ? values.color
          : values.color?.toHexString(),
    });
    if (resp.code === 200) {
      message.success('更新成功');
      getTag();
      setModalType('');
      addForm.resetFields();
    } else {
      message.error(resp.msg);
    }
  };

  const deleteTag = async (id: number) => {
    const resp = await window.electron.ipcRenderer.invoke('delete-tag', {
      id,
    });
    if (resp.code === 200) {
      message.success('删除成功');
      getTag();
    } else {
      message.error(resp.msg);
    }
  };

  window.electron.ipcRenderer.on('updateTag', () => {
    getTag();
  });

  useEffect(() => {
    getTag();
  }, []);

  const columns: any[] = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      align: 'center',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      align: 'center',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 100,
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
              addForm.setFieldsValue({
                ...record,
              });
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
                title: '确定要删除这个标签么？',
                icon: <ExclamationCircleFilled />,
                content: '请注意，这是危险操作！',
                okText: '确认',
                okType: 'danger',
                okButtonProps: {
                  type: 'primary',
                },
                cancelText: '取消',
                onOk() {
                  deleteTag(record.id);
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
    <div className={styles.tagContainer} style={style}>
      <span onClick={() => setShowTagSetModal(true)}>标签：</span>
      {typeof tag !== 'string' &&
        tag?.map((item: any) => {
          return (
            <Tag
              key={item.id}
              color={item.color}
              onClick={() => setShowTagChooseModal(true)}
            >
              {item.value}
            </Tag>
          );
        })}
      {tag.length === 0 && (
        <span onClick={() => setShowTagChooseModal(true)}>-</span>
      )}

      <Modal
        title="标签设置"
        open={showTagSetModal}
        width={750}
        okText="确定"
        cancelText="取消"
        onOk={() => {
          setShowTagSetModal(false);
        }}
        onCancel={() => {
          setShowTagSetModal(false);
        }}
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
          title={modalType === 'add' ? '新增标签' : '编辑标签'}
          open={modalType !== ''}
          width={600}
          onOk={() => {
            if (modalType === 'add') {
              addTag();
            } else {
              updateTag();
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
            initialValues={{
              color: '#1677ff',
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
              label="颜色"
              name="color"
              rules={[{ required: true, message: '请输入' }]}
            >
              <ColorPicker />
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
      </Modal>

      <Modal
        title="标签选择"
        open={showTagChooseModal}
        width={400}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setShowTagChooseModal(false)}
          >
            ok
          </Button>,
        ]}
      >
        <Checkbox.Group
          options={tagOption}
          value={
            typeof tag !== 'string' ? tag.map((item: any) => item.value) : []
          }
          onChange={(val: any) => {
            changeTag(
              tagOption.filter((item: any) => val?.includes(item.value)),
            );
          }}
        />
      </Modal>
    </div>
  );
}
