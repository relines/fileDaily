import dayjs from 'dayjs';
import connect from './index';

import calendarApi from './calendarApi';

const fs = require('fs');

export default {
  getList(params: any) {
    const { pageIndex = 1, category, keyword, searchTime } = params;
    const db = connect();

    // 获取total语法
    const stmTotal =
      category === '全部'
        ? db.prepare(
            `select count(*) total from list_table where category != @recycleCategory and createTime <= ${
              searchTime || 9999999999999
            } and (content like '%${keyword}%' or tag like '%${keyword}%')`,
          )
        : db.prepare(
            `select count(*) total from list_table where category = @category and createTime <= ${
              searchTime || 9999999999999
            } and (content like '%${keyword}%' or tag like '%${keyword}%')`,
          );
    // 实现分页语法
    const stmList =
      category === '全部'
        ? db.prepare(
            `select * from list_table where category != @recycleCategory and createTime <= ${
              searchTime || 9999999999999
            } and (content like '%${keyword}%' or tag like '%${keyword}%') ORDER BY createTime DESC LIMIT 20 OFFSET ${
              20 * pageIndex
            }`,
          )
        : db.prepare(
            `select * from list_table where category = @category and createTime <= ${
              searchTime || 9999999999999
            } and (content like '%${keyword}%' or tag like '%${keyword}%') ORDER BY createTime DESC LIMIT 20 OFFSET ${
              20 * pageIndex
            }`,
          );

    try {
      const total: any = stmTotal.all({ category, recycleCategory: '回收站' });
      const data = stmList.all({ category, recycleCategory: '回收站' });
      return { code: 200, msg: '成功', data, total: total[0]?.total };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  addList({ content, category, tag, createTime }: any) {
    const db = connect();

    const formatDay = dayjs(new Date()).format('YYYYMMDD');
    let code = Number(`${formatDay}0001`);

    // 查询当天有几条数据
    const stmList = db.prepare(
      `SELECT * FROM list_table WHERE code LIKE @formatDay`,
    );
    const stmAdd = db.prepare(
      `INSERT INTO list_table (code, content, category, tag, createTime) values (@code, @content, @category, @tag, @createTime)`,
    );

    try {
      const list = stmList.all({ formatDay: `${formatDay}%` });
      if (list.length) {
        const codeArr = list.map((item: any) => item.code);
        const maxCode = Math.max(...codeArr);
        code = maxCode + 1;
        if (maxCode.toString().slice(-4) === '9999') {
          return { code: 201, msg: '已经达到9999条数据', data: list };
        }
      }
      stmAdd.run({ code, content, category, tag, createTime });
      return {
        code: 200,
        msg: '成功',
        data: { code, content, tag, createTime },
      };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  updateList(params: any) {
    const {
      code,
      content,
      fileList,
      category,
      createTime,
      oldCreateTime,
      address,
      tag,
    } = params;
    const db = connect();

    const stmInquire = db.prepare(
      `select * from list_table where code = @code`,
    );
    const stmUpdate = db.prepare(
      `UPDATE list_table SET content = @content, fileList = @fileListJson, category = @category, createTime = @createTime, address = @address, tag = @tagJson WHERE code = @code`,
    );

    const fileListJson = JSON.stringify(fileList);
    const tagJson = JSON.stringify(tag);
    try {
      stmUpdate.run({
        content,
        category,
        createTime,
        address,
        tagJson,
        fileListJson,
        code,
      });
      const item = stmInquire.get({ code });
      if (!item) {
        return { code: 201, msg: '没有查到code', data: item };
      }

      // 如果修改了时间日期，删除日历图
      if (
        dayjs(oldCreateTime).format('YYYY-MM-DD') !==
        dayjs(createTime).format('YYYY-MM-DD')
      ) {
        calendarApi.delCalendar({
          date: dayjs(oldCreateTime).format('YYYY-MM-DD'),
        });
      }

      return { code: 200, msg: '成功', data: item };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  updateFileList(params: any) {
    const { code, fileList } = params;
    const db = connect();

    const stmInquire = db.prepare(
      `select * from list_table where code = @code`,
    );
    const stmUpdate = db.prepare(
      `UPDATE list_table SET fileList = @fileListJson WHERE code = @code`,
    );
    const fileListJson = JSON.stringify(fileList);

    try {
      stmUpdate.run({
        code,
        fileListJson,
      });
      const item = stmInquire.get({ code });
      if (!item) {
        return { code: 201, msg: '没有查到code', data: item };
      }
      return { code: 200, msg: '成功', data: item };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  delList(params: any) {
    const { code, createTime, fileList } = params;
    const db = connect();

    const stmInquire = db.prepare(
      `select * from list_table where code = @code`,
    );
    const stmDel = db.prepare(`DELETE FROM list_table WHERE code = @code`);

    try {
      const item = stmInquire.get({ code });
      if (!item) {
        return { code: 201, msg: '没有查到code2', data: item };
      }
      stmDel.run({ code });
      fileList?.forEach((item2: any) => {
        fs.unlinkSync(`${item2.url}`);
      });
      calendarApi.delCalendar({
        date: dayjs(createTime).format('YYYY-MM-DD'),
      });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
};
