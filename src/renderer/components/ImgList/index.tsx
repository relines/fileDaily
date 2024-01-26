/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lonely-if */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';

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
        setData(val);
      }}
      swapThreshold={1}
      animation={150}
      className={styles.imgListContainer}
    >
      {data?.map((item, index) => (
        <div
          key={`${item.name}_${index}`}
          className={[styles.imgItem, styles[`imgItem${imgCol}`]].join(' ')}
          onClick={() => {
            window.electron.ipcRenderer.send('open-view-window');
          }}
          style={{
            backgroundImage: `url(${item.url})`,
          }}
        />
      ))}
    </ReactSortable>
  );
}
