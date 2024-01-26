/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lonely-if */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';

import styles from './index.module.less';

require('dayjs/locale/zh-cn');

type Iprops = {
  dataSource: any[];
};

export default function Index(props: Iprops) {
  const { dataSource } = props;

  const [imgCol, setImgCol] = useState<number>(1);

  useEffect(() => {
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
    <div className={styles.imgListContainer}>
      {dataSource.map((item: any, index: number) => {
        return (
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
        );
      })}
    </div>
  );
}
