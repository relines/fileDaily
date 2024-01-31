/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect, useRef } from 'react';

import Minimap from 'react-minimap';
import 'react-minimap/dist/react-minimap.css';

import FileViewCom from './components/FileViewer';

import useWindowSize from '../../hooks/useWindowSize';

import styles from './index.module.less';

export default function ViewCom() {
  const [cur, setCur] = useState<number>(0);
  const [fileList, setFileList] = useState<any[]>([]);

  const { width, height } = useWindowSize();

  console.log(333, width, height);

  const fileRef = useRef<any>({});
  const zoomCount = useRef<number>(1);

  const getDataSource = () => {
    setFileList(JSON.parse(localStorage.getItem('fileList') || '[]'));
    setCur(Number(localStorage.getItem('activeOrder')) - 1);
  };

  useEffect(() => {
    getDataSource();
  }, []);

  // 键盘事件函数
  const PopupKeyUp = (e: any) => {
    if (e.code === 'ArrowRight') {
      let x = cur + 1;
      if (x === fileList.length) {
        x = fileList.length - 1;
      }
      setCur(x);
    }

    if (e.code === 'ArrowLeft') {
      let x = cur - 1;
      if (x <= 0) {
        x = 0;
      }
      setCur(x);
    }
  };

  useEffect(() => {
    document.addEventListener('keyup', PopupKeyUp, false);
    return () => {
      document.removeEventListener('keyup', PopupKeyUp, false);
    };
  });

  console.log(333, fileList);

  return (
    <div className={styles.viewContainer}>
      <div className={styles.header}>123</div>
      {/* <Minimap selector=".card"> */}
      <div className={styles.viewItem}>
        {fileList?.map((item: any, index: number) => {
          if (item.type === 'img' && index === cur) {
            return (
              <div
                className={styles.itemContainer}
                onWheel={(e: any) => {
                  zoomCount.current += e.deltaY * 0.0001;
                  if (zoomCount.current < 0.1) {
                    zoomCount.current = 0.1;
                  }
                  if (zoomCount.current > 10) {
                    zoomCount.current = 10;
                  }
                  // fileRef.current[
                  //   `${item.order}`
                  // ].style.transform = `scale(${zoomCount.current})`;
                  fileRef.current[`${item.order}`].style.height = `${
                    100 * zoomCount.current
                  }%`;
                }}
              >
                <div
                  className={styles.item}
                  key={item.order}
                  ref={(r: any) => {
                    fileRef.current[`${item.order}`] = r;
                  }}
                  onDrag={(e: any) => {
                    console.log(333, e);
                  }}
                >
                  <img
                    src={`atom://${item.url}`}
                    alt=""
                    // className={styles.content}
                    className={`${styles.content} card`}
                  />
                </div>
              </div>
            );
          }
          if (item.type === 'video' && index === cur) {
            return (
              <div
                className={styles.itemContainer}
                onWheel={(e: any) => {
                  zoomCount.current += e.deltaY * 0.0001;
                  if (zoomCount.current < 0.1) {
                    zoomCount.current = 0.1;
                  }
                  if (zoomCount.current > 10) {
                    zoomCount.current = 10;
                  }
                  fileRef.current[
                    `${item.order}`
                  ].style.transform = `scale(${zoomCount.current})`;
                }}
              >
                <div
                  key={item.name}
                  ref={(r: any) => {
                    fileRef.current[`${item.order}`] = r;
                  }}
                  className={styles.item}
                >
                  <video
                    controls
                    muted
                    loop
                    width="100%"
                    // className={styles.content}
                    className={`${styles.content} card`}
                  >
                    <source
                      // src="http://vjs.zencdn.net/v/oceans.mp4"
                      src={`atom://${item.url}`}
                      type="video/mp4"
                    />
                  </video>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
      {/* </Minimap> */}
    </div>
  );
}
