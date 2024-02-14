import connect from './index';

export default {
  getTag() {
    const db = connect();

    // 获取total语法
    const stmTotal = db.prepare('select count(*) total from tag_table');
    // 实现分页语法
    const stmList = db.prepare('select * from tag_table ORDER BY sort ASC');

    try {
      const total = stmTotal.all();
      const data = stmList.all();
      return { code: 200, msg: '成功', data, total };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  addTag({ name, color, sort }: any) {
    const db = connect();
    const createTime = new Date().getTime();

    // 查询当天有几条数据
    const stmQueryByName = db.prepare(
      `SELECT * FROM tag_table WHERE name LIKE @name`,
    );
    const stmQueryBySort = db.prepare(
      `SELECT * FROM tag_table WHERE sort LIKE @sort`,
    );
    const stmAdd = db.prepare(
      `INSERT INTO tag_table (name, color, sort, createTime) values (@name, @color, @sort, @createTime)`,
    );

    try {
      const listByName = stmQueryByName.all({ name });
      const listBySort = stmQueryBySort.all({ sort });
      if (listByName.length !== 0 || listBySort.length !== 0) {
        return { code: 400, msg: '名称或排序' };
      }
      stmAdd.run({ name, color, sort, createTime });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  updateTag(params: any) {
    const { id, name, color, sort } = params;
    const db = connect();

    const stmQueryByName = db.prepare(
      `SELECT * FROM tag_table WHERE name = @name and id != @id`,
    );
    const stmQueryBySort = db.prepare(
      `SELECT * FROM tag_table WHERE sort = @sort AND id != @id`,
    );

    const stmUpdate = db.prepare(
      `UPDATE tag_table SET name = @name, color = @color, sort = @sort WHERE id = @id`,
    );

    try {
      const listByName = stmQueryByName.all({ id, name });
      const listBySort = stmQueryBySort.all({ id, sort });
      if (listByName.length || listBySort.length) {
        return { code: 400, msg: '名称或排序重复' };
      }
      stmUpdate.run({ name, color, sort, id });
      return { code: 200, msg: '成功' };
    } catch (error) {
      return { code: 400, msg: error };
    }
  },
  delTag({ id }: any) {
    const db = connect();

    const stmQueryById = db.prepare(`select * from tag_table where id = @id`);
    const stmDel = db.prepare(`DELETE FROM tag_table WHERE id = @id`);

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
