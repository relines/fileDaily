/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lonely-if */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useRef, useState } from 'react';

import { ReactSortable } from 'react-sortablejs';

import styles from './index.module.less';

require('dayjs/locale/zh-cn');

type Iprops = {
  dataSource: any[];
};

export default function Index(props: Iprops) {
  const { dataSource } = props;

  const [data, setData] = useState<any[]>(dataSource);
  const [imgCol, setImgCol] = useState<number>(1);

  const fileRef = useRef<any>({});

  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  useEffect(() => {
    if (!data) return;
    if (data.length === 1) {
      setImgCol(1);
    } else {
      if (data.length < 5) {
        setImgCol(2);
      } else {
        if (data.length < 10) {
          setImgCol(3);
        } else {
          if (data.length < 17) {
            setImgCol(4);
          } else {
            setImgCol(5);
          }
        }
      }
    }
  }, [data]);

  return (
    <ReactSortable
      list={data}
      setList={(val) => {
        const orderVal = val.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
        setData(orderVal);
      }}
      swapThreshold={1}
      animation={150}
      className={styles.imgListContainer}
    >
      {data?.map((item, index) => {
        if (item.type === 'img') {
          return (
            <div
              key={`${item.name}_${index}`}
              className={[styles.imgItem, styles[`imgItem${imgCol}`]].join(' ')}
              onClick={() => {
                window.electron.ipcRenderer.send('open-view-window');
              }}
            >
              <img
                src={item.url}
                alt=""
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
          );
        }
        return (
          <div
            key={`${item.name}_${index}`}
            className={[styles.imgItem, styles[`imgItem${imgCol}`]].join(' ')}
            onClick={() => {
              window.electron.ipcRenderer.send('open-view-window');
            }}
          >
            <video
              loop
              muted
              className={styles.videoItem}
              ref={(r: any) => {
                fileRef.current[`${item.name}_${index}`] = r;
              }}
              onCanPlay={(e: any) => {
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
              }}
            >
              <source src={item.url} type="video/mp4" />
            </video>
          </div>
        );
      })}
    </ReactSortable>
  );
}
