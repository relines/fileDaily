/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-constructed-context-values */
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
    <div className={styles.categoryContainer} style={style}>
      <span>时间：</span>
      <span onClick={() => setShowTimeChooseModal(true)}>
        {dayjs(time).format('YYYY-MM-DD HH:mm:ss') || '-'}
      </span>
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
            label="时间"
            name="time"
            rules={[{ required: true, message: '请选择' }]}
          >
            <DatePicker showTime />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
