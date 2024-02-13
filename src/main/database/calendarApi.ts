import connect from './index';

export default {
  getCalendar(params: any) {
    const { month } = params;
    const db = connect();

    // 获取total语法
    const stmTotal = db.prepare(
      `SELECT count(*) total FROM calendar_table WHERE strftime('%Y-%m', date) IN (${month
        .map((item: string) => `'${item}'`)
        .join(',')})`,
    );

    // 获取包含特定值的记录
    const stmList = db.prepare(
      `SELECT * FROM calendar_table WHERE strftime('%Y-%m', date) IN (${month
        .map((item: string) => `'${item}'`)
        .join(',')})`,
    );

    try {
      const total: any = stmTotal.all();
      const data = stmList.all();
      return { code: 200, msg: '成功', data, total: total[0]?.total };
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
    const { date, url, type } = params;
    const db = connect();

    const stmQueryByDate = db.prepare(
      `SELECT * FROM calendar_table WHERE date LIKE @date`,
    );
    const stmAdd = db.prepare(
      `INSERT INTO calendar_table (date, url, type) values (@date, @url, @type)`,
    );
    const stmUpdate = db.prepare(
      `UPDATE calendar_table SET url = @url, type = @type WHERE date = @date`,
    );

    try {
      const listByDate = stmQueryByDate.all({ date });
      if (listByDate.length === 0) {
        stmAdd.run({ date, url, type });
      } else {
        stmUpdate.run({ date, url, type });
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
