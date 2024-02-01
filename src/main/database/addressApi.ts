import connect from './index';

export default {
  getAddress() {
    const db = connect();

    // 获取total语法
    const stmTotal = db.prepare('select count(*) total from address_table');
    // 实现分页语法
    const stmList = db.prepare('select * from address_table');

    try {
      const total = stmTotal.all();
      const data = stmList.all();
      return { code: 200, msg: '成功', data, total };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  addAddress({ content }: any) {
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
  updateAddress(params: any) {
    const { id, content } = params;
    const db = connect();

    const stmQueryById = db.prepare(
      `select * from address_table where id = @id`,
    );

    const stmUpdate = db.prepare(
      `UPDATE address_table SET content = @content WHERE id = @id`,
    );

    try {
      const listById = stmQueryById.all({ id });
      if (listById.length !== 0) {
        return { code: 400, msg: 'repeat' };
      }
      stmUpdate.run({ content, id });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  delAddress({ id }: any) {
    const db = connect();

    const stmQueryById = db.prepare(
      `select * from address_table where id = @id`,
    );
    const stmDel = db.prepare(`DELETE FROM address_table WHERE id = @id`);

    try {
      const item = stmQueryById.get({ id });
      if (!item) {
        return { code: 400, msg: '没有查到code', data: item };
      }
      stmDel.run({ id });
      return { code: 200, msg: '删除成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
};
