import React, { useEffect, useRef, useState } from 'react';

import { Dropdown, Form, message } from 'antd';
import { ModalForm, ProFormText } from '@ant-design/pro-components';

import { ReactSortable } from 'react-sortablejs';
import dayjs from 'dayjs';

import { RightCircleOutlined } from '@ant-design/icons';

import styles from './index.module.less';

require('dayjs/locale/zh-cn');

type Iprops = {
  dataSource: any;
  changeDataSource: (
    type: 'more' | 'new' | 'save' | 'delete' | 'rename',
    data?: any,
  ) => void;
  queryCalendarInfo: () => void;
};

export default function FileListShow(props: Iprops) {
  const { dataSource, changeDataSource, queryCalendarInfo } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const [imgCol, setImgCol] = useState<number>(1);
  const [modalShow, setModalShow] = useState(false);
  const [fileList, setFileList] = useState(
    dataSource.fileList ? JSON.parse(dataSource.fileList) : [],
  );

  const fileRef = useRef<any>({});

  const [form] = Form.useForm<{ originName: string; newName: string }>();

  useEffect(() => {
    if (dataSource) {
      setFileList(dataSource.fileList ? JSON.parse(dataSource.fileList) : []);
    }
  }, [dataSource]);

  const updateFileList = async (val: any) => {
    const result = await window.electron.ipcRenderer.invoke(
      'update-file-list',
      val,
    );
    messageApi.open({
      type: 'success',
      content: '保存成功',
    });
    changeDataSource('rename', result?.data);
  };

  const updateCalendar = async (date: string, url: string, type: string) => {
    const resp = await window.electron.ipcRenderer.invoke('update-calendar', {
      date,
      url,
      type,
    });
    if (resp.code === 200) {
      messageApi.open({
        type: 'success',
        content: '保存成功',
      });
      queryCalendarInfo();
      setTimeout(() => {
        queryCalendarInfo();
      }, 400);
    } else {
      messageApi.open({
        type: 'error',
        content: resp.msg,
      });
    }
  };

  const changeFileName = async (values: any) => {
    const url = fileList[0].url.replace(fileList[0].name, '');
    const resp = await window.electron.ipcRenderer.invoke('change-file-name', {
      ...values,
      url,
    });
    if (resp.code === 200) {
      messageApi.open({
        type: 'success',
        content: '修改成功',
      });
      const newFileList = fileList.map((item: any) => {
        if (item.name === values.originName) {
          item.name = values.newName;
          item.url = `${url}${values.newName}`;
        }
        return item;
      });
      updateFileList({
        code: dataSource.code,
        fileList: newFileList,
      });
      setModalShow(false);
    } else {
      messageApi.open({
        type: 'error',
        content: resp.msg,
      });
    }
  };

  useEffect(() => {
    if (!fileList) return;
    if (fileList.length === 1) {
      setImgCol(1);
    } else {
      if (fileList.length < 5) {
        setImgCol(2);
      } else {
        if (fileList.length < 10) {
          setImgCol(3);
        } else {
          if (fileList.length < 17) {
            setImgCol(4);
          } else {
            setImgCol(5);
          }
        }
      }
    }
  }, [fileList]);

  return (
    <div>
      {contextHolder}
      <ReactSortable
        list={fileList}
        setList={() => {}}
        swapThreshold={1}
        animation={150}
        className={styles.imgListContainer}
      >
        {fileList?.map((item: any, index: number) => {
          if (item.type === 'img') {
            return (
              <Dropdown
                menu={{
                  items: [
                    {
                      label: (
                        <div
                          style={{
                            width: '86px',
                            height: '15px',
                            lineHeight: '15px',
                            textAlign: 'center',
                          }}
                          onClick={() => {
                            window.electron.ipcRenderer.send(
                              'open-folder',
                              item.url,
                            );
                          }}
                        >
                          打开文件位置
                        </div>
                      ),
                      key: 'open',
                    },
                    {
                      label: (
                        <div
                          style={{
                            width: '86px',
                            height: '15px',
                            lineHeight: '15px',
                            textAlign: 'center',
                          }}
                          onClick={() => {
                            form.setFieldsValue({
                              originName: item.name,
                            });
                            setModalShow(true);
                          }}
                        >
                          重命名
                        </div>
                      ),
                      key: 'rename',
                    },
                    {
                      label: (
                        <div
                          style={{
                            width: '86px',
                            height: '15px',
                            lineHeight: '15px',
                            textAlign: 'center',
                          }}
                          onClick={() => {
                            const date = dayjs(dataSource.createTime).format(
                              'YYYY-MM-DD',
                            );
                            updateCalendar(date, item.url, item.type);
                          }}
                        >
                          设为日历图
                        </div>
                      ),
                      key: 'calendar',
                    },
                  ],
                }}
                trigger={['contextMenu']}
                key={item.name}
              >
                <div
                  key={`${item.name}_${index}`}
                  className={[styles.imgItem, styles[`imgItem${imgCol}`]].join(
                    ' ',
                  )}
                  onClick={() => {
                    window.electron.ipcRenderer.send('open-view-window');
                    localStorage.setItem('activeOrder', item.order);
                    localStorage.setItem('fileList', JSON.stringify(fileList));
                  }}
                >
                  <img
                    src={`atom:/${item.url}`}
                    alt={item.url}
                    ref={(r: any) => {
                      fileRef.current[`${item.name}_${index}`] = r;
                    }}
                    onLoad={(e: any) => {
                      if (fileList.length === 1) {
                        fileRef.current[`${item.name}_${index}`].style.width =
                          '100%';
                        fileRef.current[`${item.name}_${index}`].style.height =
                          'auto';
                      } else {
                        if (e.target.width > e.target.height) {
                          fileRef.current[`${item.name}_${index}`].style.width =
                            'auto';
                          fileRef.current[
                            `${item.name}_${index}`
                          ].style.height = '100%';
                        } else {
                          fileRef.current[`${item.name}_${index}`].style.width =
                            '100%';
                          fileRef.current[
                            `${item.name}_${index}`
                          ].style.height = 'auto';
                        }
                      }
                    }}
                  />
                </div>
              </Dropdown>
            );
          }

          if (
            item.type === 'video' &&
            fileRef.current[`${item.name}_${index}`]
          ) {
            fileRef.current[`${item.name}_${index}`].currentTime = 10;
          }

          return (
            <Dropdown
              menu={{
                items: [
                  {
                    label: (
                      <div
                        style={{
                          width: '86px',
                          height: '15px',
                          lineHeight: '15px',
                          textAlign: 'center',
                        }}
                        onClick={() => {
                          window.electron.ipcRenderer.send(
                            'open-folder',
                            item.url,
                          );
                        }}
                      >
                        打开文件位置
                      </div>
                    ),
                    key: 'open',
                  },
                  {
                    label: (
                      <div
                        style={{
                          width: '86px',
                          height: '15px',
                          lineHeight: '15px',
                          textAlign: 'center',
                        }}
                        onClick={() => {
                          form.setFieldsValue({
                            originName: item.name,
                          });
                          setModalShow(true);
                        }}
                      >
                        重命名
                      </div>
                    ),
                    key: 'rename',
                  },
                  {
                    label: (
                      <div
                        style={{
                          width: '86px',
                          height: '15px',
                          lineHeight: '15px',
                          textAlign: 'center',
                        }}
                        onClick={() => {
                          const date = dayjs(dataSource.createTime).format(
                            'YYYY-MM-DD',
                          );
                          updateCalendar(date, item.url, item.type);
                        }}
                      >
                        设为日历图
                      </div>
                    ),
                    key: 'calendar',
                  },
                ],
              }}
              trigger={['contextMenu']}
              key={item.name}
            >
              <div
                key={`${item.name}_${index}`}
                className={[styles.imgItem, styles[`imgItem${imgCol}`]].join(
                  ' ',
                )}
                onClick={() => {
                  window.electron.ipcRenderer.send('open-view-window');
                  localStorage.setItem('activeOrder', item.order);
                  localStorage.setItem('fileList', JSON.stringify(fileList));
                }}
              >
                <RightCircleOutlined
                  className={styles.videoIcon}
                  style={{
                    color: '#fff',
                  }}
                />
                <video
                  loop
                  muted
                  className={styles.videoItem}
                  ref={(r: any) => {
                    fileRef.current[`${item.name}_${index}`] = r;
                  }}
                  onCanPlay={(e: any) => {
                    // if (item.initialPlay) return;
                    // item.initialPlay = true;
                    // const videoDuration =
                    //   fileRef.current[`${item.name}_${index}`].duration;
                    // const quotient = Math.round(videoDuration / 2);
                    console.log('currentTime');
                    // fileRef.current[`${item.name}_${index}`].currentTime =
                    //   quotient;

                    if (fileList?.length === 1) {
                      fileRef.current[`${item.name}_${index}`].style.width =
                        '100%';
                      fileRef.current[`${item.name}_${index}`].style.height =
                        'none';
                    } else {
                      if (e.target.videoWidth > e.target.videoHeight) {
                        fileRef.current[`${item.name}_${index}`].style.width =
                          'none';
                        fileRef.current[`${item.name}_${index}`].style.height =
                          '100%';
                      } else {
                        fileRef.current[`${item.name}_${index}`].style.width =
                          '100%';
                        fileRef.current[`${item.name}_${index}`].style.height =
                          'none';
                      }
                    }
                  }}
                >
                  <source src={`atom:/${item.url}`} type="video/mp4" />
                </video>
              </div>
            </Dropdown>
          );
        })}
      </ReactSortable>
      <ModalForm<{
        originName: string;
        newName: string;
      }>
        title="重命名"
        form={form}
        open={modalShow}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
          forceRender: true,
          onCancel: () => setModalShow(false),
        }}
        submitTimeout={2000}
        onFinish={async (values) => {
          changeFileName(values);
        }}
      >
        <ProFormText
          name="originName"
          label="原名称"
          width="md"
          disabled
          placeholder="请输入名称"
        />

        <ProFormText
          name="newName"
          label={
            <div
              style={{
                cursor: 'pointer',
              }}
              onClick={() => {
                form.setFieldsValue({
                  newName: form.getFieldValue('originName'),
                });
              }}
            >
              新名称
            </div>
          }
          width="md"
          placeholder="请输入名称"
        />
      </ModalForm>
    </div>
  );
}
