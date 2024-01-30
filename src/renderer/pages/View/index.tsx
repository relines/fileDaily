/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect, useRef } from 'react';

import styles from './index.module.less';

export default function ViewCom() {
  const [cur, setCur] = useState<number>(0);
  const [fileList, setFileList] = useState<any[]>([]);

  const getDataSource = () => {
    setFileList(JSON.parse(localStorage.getItem('fileList') || '[]'));
    setCur(Number(localStorage.getItem('activeOrder')) - 1);
  };

  useEffect(() => {
    getDataSource();
  }, []);

  console.log(333, fileList);

  return (
    <div className={styles.viewContainer}>
      {/* <button
        type="button"
        onClick={() => {
          setCur((x) => x + 1);
        }}
      >
        next
      </button>
      <button
        type="button"
        onClick={() => {
          setCur(0);
        }}
      >
        reset
      </button> */}
      <div className={styles.header}>123</div>
      <div className={styles.vieItem}>
        {fileList?.map((item: any, index: number) => {
          if (item.type === 'img' && index === cur) {
            return (
              <div className={styles.item} key={item.name}>
                <img
                  src={`atom://${item.url}`}
                  alt=""
                  className={styles.content}
                />
              </div>
            );
          }
          if (item.type === 'video' && index === cur) {
            return (
              <div key={item.name} className={styles.item}>
                <video
                  controls
                  muted
                  loop
                  width="100%"
                  className={styles.content}
                >
                  <source
                    // src="http://vjs.zencdn.net/v/oceans.mp4"
                    src={`atom://${item.url}`}
                    type="video/mp4"
                  />
                </video>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
