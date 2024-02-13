import dayjs from 'dayjs';
import connect from './index';

export default {
  getCalendar(params: any) {
    const { month } = params;
    console.log(123, month);
    // console.log(333, dayjs(month[0]).format('YYYY-MM'));
    // console.log(333, dayjs(month[0]));
    const db = connect();

    // 获取total语法
    const stmTotal = db.prepare('select count(*) total from calendar_table');
    // 实现分页语法
    const stmList = db.prepare('select * from calendar_table');

    try {
      const total = stmTotal.all();
      const data = stmList.all();
      return { code: 200, msg: '成功', data, total };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  addCalendar({ content }: any) {
    const db = connect();
    const createTime = new Date().getTime();

    const stmQueryByContent = db.prepare(
      `SELECT * FROM address_table WHERE content LIKE @content`,
    );
    const stmAdd = db.prepare(
      `INSERT INTO address_table (content, createTime) values (@content, @createTime)`,
    );

    try {
      const listByName = stmQueryByContent.all({ content });
      if (listByName.length !== 0) {
        return { code: 400, msg: 'repeat' };
      }
      stmAdd.run({ content, createTime });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  updateCalendar(params: any) {
    const { date, url } = params;
    const db = connect();

    const stmQueryByDate = db.prepare(
      `SELECT * FROM calendar_table WHERE date LIKE @date`,
    );
    const stmAdd = db.prepare(
      `INSERT INTO calendar_table (date, url) values (@date, @url)`,
    );
    const stmUpdate = db.prepare(
      `UPDATE calendar_table SET url = @url WHERE date = @date`,
    );

    try {
      const listByDate = stmQueryByDate.all({ date });
      if (listByDate.length === 0) {
        stmAdd.run({ date, url });
      } else {
        stmUpdate.run({ date, url });
      }
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  delCalendar({ date }: any) {
    const db = connect();

    const stmQueryById = db.prepare(
      `select * from calendar_table where id = @id`,
    );
    const stmDel = db.prepare(`DELETE FROM calendar_table WHERE date = @date`);

    try {
      const item = stmQueryById.get({ date });
      if (!item) {
        return { code: 400, msg: '没有查到date', data: item };
      }
      stmDel.run({ date });
      return { code: 200, msg: '删除成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
};
