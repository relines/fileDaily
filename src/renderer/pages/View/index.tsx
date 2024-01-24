/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect, useRef } from 'react';

import styles from './index.module.less';

export default function ViewCom() {
  const [cur, setCur] = useState(0);
  const data = [
    {
      name: 'pic2',
      type: 'img',
      url: 'atom://Users/jianghuayu/Documents/p2.jpg',
    },
    {
      name: 'video1',
      type: 'video',
      url: 'atom://Users/jianghuayu/Documents/想某人.mp4',
    },
    // {
    //   name: 'video3',
    //   type: 'video',
    //   url: 'atom://Users/jianghuayu/Documents/HHTJ.mp4',
    // },
    {
      name: 'pic3',
      type: 'img',
      url: 'atom://Users/jianghuayu/Documents/p3.jpg',
    },
    {
      name: 'pic4',
      type: 'img',
      url: 'atom://Users/jianghuayu/Documents/p4.jpg',
    },
  ];

  return (
    <div className={styles.viewContainer}>
      <button
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
      </button>
      <div className={styles.swiperContainer}>
        {data.map((item: any, index: number) => {
          if (item.type === 'img' && index === cur) {
            return (
              <div className={styles.item} key={item.name}>
                <img src={item.url} alt="" />
              </div>
            );
          }
          if (item.type === 'video' && index === cur) {
            return (
              <div key={item.name} className={styles.item}>
                <video controls muted loop width="100%">
                  <source
                    // src="http://vjs.zencdn.net/v/oceans.mp4"
                    src={item.url}
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
