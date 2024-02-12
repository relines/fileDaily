/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect, useRef } from 'react';

import Draggable from 'react-draggable';
import useWindowSize from '../../hooks/useWindowSize';

import styles from './index.module.less';

export default function ViewCom() {
  const [cur, setCur] = useState<number>(0);
  const [fileList, setFileList] = useState<any[]>([]);

  const { windowWidth, windowHeight } = useWindowSize();

  const fileRef = useRef<any>({});
  const contentRef = useRef<any>({});
  const zoomCount = useRef<number>(1);

  const getDataSource = () => {
    setFileList(JSON.parse(localStorage.getItem('fileList') || '[]'));
    setCur(Number(localStorage.getItem('activeOrder')) - 1);
  };

  useEffect(() => {
    getDataSource();
  }, []);

  const resetFileSize = () => {
    const file = fileRef.current[cur + 1];
    if (!file) return;

    let fileWidth = 0;
    let fileHeight = 0;

    if (fileList[cur].type === 'img') {
      fileWidth = file?.width;
      fileHeight = file?.height;
      if (windowWidth / windowHeight > fileWidth / fileHeight) {
        setTimeout(() => {
          file.style.width = 'auto';
          file.style.height = '100%';
        }, 100);
      } else {
        setTimeout(() => {
          file.style.width = '100%';
          file.style.height = 'auto';
        }, 100);
      }
    } else {
      fileWidth = file?.clientWidth;
      fileHeight = file?.clientHeight;
      if (windowWidth / windowHeight > fileWidth / fileHeight) {
        setTimeout(() => {
          file.style.maxWidth = 'none';
          file.style.maxHeight = '100%';
        }, 100);
      } else {
        setTimeout(() => {
          file.style.maxWidth = '100%';
          file.style.maxHeight = 'none';
        }, 100);
      }
    }
  };

  useEffect(() => {
    resetFileSize();
  }, [windowWidth, windowHeight, cur]);

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

  return (
    <div className={styles.viewContainer}>
      {/* <div className={styles.header}>123</div> */}

      <div className={styles.viewItem}>
        {fileList?.map((item: any, index: number) => {
          if (item.type === 'img' && index === cur) {
            return (
              <Draggable key={item.order} handle=".handle">
                <div
                  className={styles.itemContainer}
                  onWheel={(e: any) => {
                    zoomCount.current -= e.deltaY * 0.0001;
                    if (zoomCount.current < 0.1) {
                      zoomCount.current = 0.1;
                    }
                    if (zoomCount.current > 10) {
                      zoomCount.current = 10;
                    }
                    contentRef.current[
                      `${item.order}`
                    ].style.transform = `scale(${zoomCount.current})`;
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  <div
                    className={`${styles.item} handle`}
                    key={item.order}
                    title={`atom://${item.url}`}
                    ref={(r: any) => {
                      contentRef.current[`${item.order}`] = r;
                    }}
                  >
                    <img
                      src={`atom://${item.url}`}
                      alt=""
                      ref={(r: any) => {
                        fileRef.current[`${item.order}`] = r;
                      }}
                      style={{
                        pointerEvents: 'none',
                      }}
                      className={styles.content}
                    />
                  </div>
                </div>
              </Draggable>
            );
          }
          if (item.type === 'video' && index === cur) {
            return (
              <Draggable key={item.order}>
                <div
                  className={styles.itemContainer}
                  onWheel={(e: any) => {
                    zoomCount.current -= e.deltaY * 0.0001;
                    if (zoomCount.current < 0.1) {
                      zoomCount.current = 0.1;
                    }
                    if (zoomCount.current > 10) {
                      zoomCount.current = 10;
                    }
                    contentRef.current[
                      `${item.order}`
                    ].style.transform = `scale(${zoomCount.current})`;
                  }}
                >
                  <div
                    key={item.name}
                    ref={(r: any) => {
                      contentRef.current[`${item.order}`] = r;
                    }}
                    title={`atom://${item.url}`}
                    className={styles.item}
                  >
                    <video
                      controls
                      muted
                      loop
                      width="100%"
                      className={styles.content}
                      ref={(r: any) => {
                        fileRef.current[`${item.order}`] = r;
                      }}
                    >
                      <source
                        // src="http://vjs.zencdn.net/v/oceans.mp4"
                        src={`atom://${item.url}`}
                        type="video/mp4"
                      />
                    </video>
                  </div>
                </div>
              </Draggable>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
