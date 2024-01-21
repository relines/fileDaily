import connect from './index';

export default {
  getData() {
    const db = connect();

    // const stmAllTable = db.prepare('select * from sqlite_master');
    const stmAllTable = db.prepare(
      `select name from sqlite_master where type='table' order by name`,
    );
    const tables = stmAllTable.all();
    console.log('-------------->tables:', tables);

    // 获取total语法
    const stmTotal = db.prepare('select count(*) total from category_table');
    // 实现分页语法
    const stmList = db.prepare(
      'select * from category_table ORDER BY sort ASC',
    );

    try {
      const total = stmTotal.all();
      const data = stmList.all();
      return { code: 200, msg: '成功', data, total };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  addData({ name, remark, sort, category }: any) {
    const db = connect();
    const createTime = new Date().getTime();

    // 查询当天有几条数据
    const stmQueryByName = db.prepare(
      `SELECT * FROM category_table WHERE name LIKE @name`,
    );
    const stmQueryBySort = db.prepare(
      `SELECT * FROM category_table WHERE sort LIKE @sort`,
    );
    const stmAdd = db.prepare(
      `INSERT INTO category_table (name, remark, sort, category, createTime) values (@name, @remark, @sort, @category, @createTime)`,
    );

    try {
      const listByName = stmQueryByName.all({ name });
      const listBySort = stmQueryBySort.all({ sort });
      if (listByName.length !== 0 || listBySort.length !== 0) {
        return { code: 400, msg: 'repeat' };
      }
      stmAdd.run({ name, remark, sort, category, createTime });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  updateData(params: any) {
    const { id, name, remark, sort } = params;
    const db = connect();

    const stmQueryByName = db.prepare(
      `SELECT * FROM category_table WHERE name LIKE @name`,
    );
    const stmQueryById = db.prepare(
      `select * from category_table where id = @id`,
    );

    const stmUpdate = db.prepare(
      `UPDATE category_table SET name = @name, remark = @remark, sort = @sort WHERE id = @id`,
    );

    try {
      const listByName = stmQueryByName.all({ name });
      const listById = stmQueryById.all({ id });
      if (listByName.length !== 0 || listById.length !== 0) {
        return { code: 400, msg: 'repeat' };
      }
      stmUpdate.run({ name, remark, sort, id });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  setCurrent(params: any) {
    const { name } = params;
    const db = connect();

    const stmQueryCurrent1 = db.prepare(
      `select * from category_table where current = 1`,
    );
    const stmUpdate2 = db.prepare(`UPDATE category_table SET current = 2`);
    const stmUpdate1 = db.prepare(
      `UPDATE category_table SET current = 1 WHERE name = @name`,
    );

    try {
      stmUpdate2.run();
      stmUpdate1.run({ name });
      const item = stmQueryCurrent1.get();
      console.log(333, item);
      if (!item) {
        return { code: 400, msg: '没有查到code' };
      }
      return { code: 200, msg: '成功', data: item };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  delData({ id }: any) {
    const db = connect();

    const stmQueryById = db.prepare(
      `select * from category_table where id = @id`,
    );
    const stmDel = db.prepare(`DELETE FROM category_table WHERE id = @id`);

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
