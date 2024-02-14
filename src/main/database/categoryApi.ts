import connect from './index';

export default {
  getCategory() {
    const db = connect();

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
  addCategory({ name, remark, sort }: any) {
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
      `INSERT INTO category_table (name, remark, sort, createTime) values (@name, @remark, @sort, @createTime)`,
    );

    try {
      const listByName = stmQueryByName.all({ name });
      const listBySort = stmQueryBySort.all({ sort });
      if (listByName.length !== 0 || listBySort.length !== 0) {
        return { code: 400, msg: '名称或排序重复' };
      }
      stmAdd.run({ name, remark, sort, createTime });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  updateCategory(params: any) {
    const { id, name, remark, sort } = params;
    const db = connect();

    const stmQueryByName = db.prepare(
      `SELECT * FROM category_table WHERE name = @name and id != @id`,
    );
    const stmQueryBySort = db.prepare(
      `select * from category_table where sort = @sort and id != @id`,
    );

    const stmUpdate = db.prepare(
      `UPDATE category_table SET name = @name, remark = @remark, sort = @sort WHERE id = @id`,
    );

    try {
      const listByName = stmQueryByName.all({ id, name });
      const listBySort = stmQueryBySort.all({ id, sort });
      if (listByName.length !== 0 || listBySort.length !== 0) {
        return { code: 400, msg: '名称或排序重复' };
      }
      stmUpdate.run({ name, remark, sort, id });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  delCategory({ id }: any) {
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
