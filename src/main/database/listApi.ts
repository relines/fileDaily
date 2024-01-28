import dayjs from 'dayjs';
import connect from './index';

export default {
  getList(params: any) {
    const { pageIndex = 1 } = params;
    const db = connect();

    // 获取total语法
    const stmTotal = db.prepare('select count(*) total from list_table');
    // 实现分页语法
    const stmList = db.prepare(
      `select * from list_table ORDER BY code DESC LIMIT 10 OFFSET ${
        10 * pageIndex
      }`,
    );

    try {
      const total: any = stmTotal.all();
      const data = stmList.all();
      return { code: 200, msg: '成功', data, total: total[0]?.total };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  addList({ content, tag, createTime }: any) {
    const db = connect();

    const formatDay = dayjs(new Date()).format('YYYYMMDD');
    let code = Number(`${formatDay}0001`);

    // 查询当天有几条数据
    const stmList = db.prepare(
      `SELECT * FROM list_table WHERE code LIKE @formatDay`,
    );
    const stmAdd = db.prepare(
      `INSERT INTO list_table (code, content, tag, createTime) values (@code, @content, @tag, @createTime)`,
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
      stmAdd.run({ code, content, tag, createTime });
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
    const { code, content, fileList, category, tag } = params;
    const db = connect();

    const stmInquire = db.prepare(
      `select * from list_table where code = @code`,
    );
    const stmUpdate = db.prepare(
      `UPDATE list_table SET content = @content, fileList = @fileListStr, category=@category, tag = @tag WHERE code = @code`,
    );
    const fileListStr = JSON.stringify(fileList);

    try {
      stmUpdate.run({ content, category, tag, fileListStr, code });
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
    const { code } = params;
    const db = connect();

    const stmInquire = db.prepare(
      `select * from list_table where code = @code`,
    );
    const stmDel = db.prepare(`DELETE FROM list_table WHERE code = @code`);

    try {
      const item = stmInquire.get({ code });
      if (!item) {
        return { code: 201, msg: '没有查到code', data: item };
      }
      stmDel.run({ code });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
};
