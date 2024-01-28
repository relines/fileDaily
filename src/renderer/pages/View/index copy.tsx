/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect, useRef } from 'react';

import styles from './index.module.less';

export default function IndexCom() {
  const [testUrl, setTestUrl] = useState<string>();
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
    {
      name: 'video3',
      type: 'video',
      url: 'atom://Users/jianghuayu/Documents/HHTJ.mp4',
    },
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
    // {
    //   name: 'pic1',
    //   type: 'img',
    //   url: 'atom://Users/popmart/Documents/fileDaily/file/test.png',
    // },
    // {
    //   name: 'pic2',
    //   type: 'img',
    //   url: 'atom:///file://Users/popmart/Documents/fileDaily/file/test.png',
    // },
    // {
    //   name: 'video2',
    //   type: 'video',
    //   url: 'atom://Users/popmart/Documents/fileDaily/file/oceans.mp4',
    // },
  ];
  const getVideoPath = async () => {
    const resp = await window.electron.ipcRenderer.invoke('get-video-path', {});
    const uint8Buffer = Uint8Array.from(resp.data);
    const bolb = new Blob([uint8Buffer]);
    const objUrl = window.URL.createObjectURL(bolb);
    setTestUrl(objUrl);
  };

  return (
    <div className={styles.viewContainer}>
      <button
        type="button"
        onClick={() => {
          getVideoPath();
        }}
      >
        getVideoPath
      </button>
      {testUrl && (
        <div>
          <video controls muted loop width="300">
            <source
              // src="http://vjs.zencdn.net/v/oceans.mp4"
              src={testUrl}
              type="video/mp4"
            />
          </video>
        </div>
      )}
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
      })}
    </div>
  );
}
