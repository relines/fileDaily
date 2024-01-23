/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect, useRef } from 'react';

import styles from './index.module.less';

export default function IndexCom() {
  const data = [
    {
      name: 'pic1',
      type: 'img',
      url: '/Users/jianghuayu/Documents/p1.jpg',
    },
    {
      name: 'pic2',
      type: 'img',
      url: '/Users/jianghuayu/Documents/p2.jpg',
    },
    {
      name: 'video1',
      type: 'video',
      url: '/Users/jianghuayu/Documents/想某人.mp4',
    },
    {
      name: 'pic3',
      type: 'img',
      url: '/Users/jianghuayu/Documents/p3.jpg',
    },
    {
      name: 'video2',
      type: 'video',
      url: '/Users/jianghuayu/Documents/test.mp4',
    },
    {
      name: 'pic4',
      type: 'img',
      url: '/Users/jianghuayu/Documents/p4',
    },
  ];
  return (
    <div className={styles.viewContainer}>
      123
      {data.map((item: any, index: number) => {
        if (item.type === 'img') {
          return (
            <div key={item.name}>
              <img src={item.url} alt="" />
            </div>
          );
        }
        if (item.type === 'video') {
          return (
            <div key={item.name}>
              <img
                src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                alt=""
              />
            </div>
          );
        }
      })}
    </div>
  );
}
