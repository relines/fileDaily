/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lonely-if */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useRef, useState } from 'react';

import { Dropdown } from 'antd';

import { ReactSortable } from 'react-sortablejs';

import { RightCircleOutlined } from '@ant-design/icons';

import styles from './index.module.less';

require('dayjs/locale/zh-cn');

type Iprops = {
  dataSource: any[];
  changeDataSource: (val: any) => void;
  activeItem: any;
};

export default function Index(props: Iprops) {
  const { dataSource, activeItem, changeDataSource } = props;

  const [imgCol, setImgCol] = useState<number>(1);

  const fileRef = useRef<any>({});

  useEffect(() => {
    if (!dataSource) return;
    if (dataSource.length === 1) {
      setImgCol(1);
    } else {
      if (dataSource.length < 5) {
        setImgCol(2);
      } else {
        if (dataSource.length < 10) {
          setImgCol(3);
        } else {
          if (dataSource.length < 17) {
            setImgCol(4);
          } else {
            setImgCol(5);
          }
        }
      }
    }
  }, [dataSource]);

  return (
    <ReactSortable
      list={dataSource}
      setList={(val) => {
        const orderVal = val.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
        changeDataSource(orderVal);
      }}
      swapThreshold={1}
      animation={150}
      className={styles.imgListContainer}
    >
      {dataSource?.map((item, index) => {
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
                          const list = dataSource.filter(
                            (item2: any) => item2.name !== item.name,
                          );
                          changeDataSource(list);
                        }}
                      >
                        删除
                      </div>
                    ),
                    key: 'edit',
                  },
                ],
              }}
              trigger={['contextMenu']}
            >
              <div
                key={`${item.name}_${index}`}
                className={[styles.imgItem, styles[`imgItem${imgCol}`]].join(
                  ' ',
                )}
              >
                <img
                  src={`atom:/${item.url}`}
                  alt={item.url}
                  ref={(r: any) => {
                    fileRef.current[`${item.name}_${index}`] = r;
                  }}
                  onLoad={(e: any) => {
                    if (e.target.width > e.target.height) {
                      fileRef.current[`${item.name}_${index}`].style.width =
                        'auto';
                      fileRef.current[`${item.name}_${index}`].style.height =
                        '100%';
                    } else {
                      fileRef.current[`${item.name}_${index}`].style.width =
                        '100%';
                      fileRef.current[`${item.name}_${index}`].style.height =
                        'auto';
                    }
                  }}
                />
              </div>
            </Dropdown>
          );
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
                        const list = dataSource.filter(
                          (item2: any) => item2.name !== item.name,
                        );
                        changeDataSource(list);
                      }}
                    >
                      删除
                    </div>
                  ),
                  key: 'edit',
                },
              ],
            }}
            trigger={['contextMenu']}
          >
            <div
              key={`${item.name}_${index}`}
              className={[styles.imgItem, styles[`imgItem${imgCol}`]].join(' ')}
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
                  if (dataSource?.length === 1) {
                    fileRef.current[`${item.name}_${index}`].style.maxWidth =
                      '100%';
                    fileRef.current[`${item.name}_${index}`].style.maxHeight =
                      'none';
                  } else {
                    if (e.target.videoWidth > e.target.videoHeight) {
                      fileRef.current[`${item.name}_${index}`].style.maxWidth =
                        'none';
                      fileRef.current[`${item.name}_${index}`].style.maxHeight =
                        '100%';
                    } else {
                      fileRef.current[`${item.name}_${index}`].style.maxWidth =
                        '100%';
                      fileRef.current[`${item.name}_${index}`].style.maxHeight =
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
  );
}
