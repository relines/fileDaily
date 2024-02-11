import React, { useEffect, useState } from 'react';

import { Form, Modal, DatePicker } from 'antd';

import dayjs from 'dayjs';

import styles from './index.module.less';

type Iprops = {
  time: any;
  changeTime: (val: number) => void;
  style: any;
};

export default function HeaderCom(props: Iprops) {
  const { style, time, changeTime } = props;

  const [showTimeChooseModal, setShowTimeChooseModal] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      time: dayjs(time),
    });
  }, [time]);

  return (
    <div className={styles.timeContainer} style={style}>
      <span
        style={{
          userSelect: 'none',
          cursor: 'pointer',
        }}
        onClick={() => {
          changeTime(dayjs(new Date()).valueOf());
        }}
      >
        时间：
      </span>
      <span onClick={() => setShowTimeChooseModal(true)}>
        {dayjs(time).format('YYYY-MM-DD HH:mm:ss') || '-'}
      </span>
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
        <Modal
          title="时间设置"
          open={showTimeChooseModal}
          width={400}
          onOk={() => {
            const formVal = form.getFieldsValue();
            changeTime(dayjs(formVal.time).valueOf());
            setShowTimeChooseModal(false);
          }}
          onCancel={() => setShowTimeChooseModal(false)}
        >
          <Form.Item
            label="时间"
            name="time"
            rules={[{ required: true, message: '请选择' }]}
          >
            <DatePicker showTime />
          </Form.Item>
        </Modal>
      </Form>
    </div>
  );
}
