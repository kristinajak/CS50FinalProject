const pool = require('./db');

async function getChecklistItems(tableName) {
    const conn = await pool.getConnection();
    const [rows, fields] = await conn.query(`SELECT * FROM ${tableName} WHERE user_id = 'default'`);
    conn.release();
    return rows.map(row => { return {id: row.id, item: row.item} });
  }

function getFirstWord(tableName) {
  const words = tableName.split('_');
  return words[0].charAt(0).toUpperCase() + words[0].slice(1);
}

async function renderChecklistView(req, res) {
  if (req.session.userId) {
    const userId = req.session.userId || 'default';
    const docsItems = await userChecklistItems('documents', userId);
    const generalItems = await userChecklistItems('general', userId);
    const toiletriesItems = await userChecklistItems('toiletries', userId);
    const clothesItems = await userChecklistItems('clothes', userId);
    const medicineItems = await userChecklistItems('medicine', userId);
    const ToDoItems = await userChecklistItems('ToDo', userId);

    const docsItemsChecked = await userChecklistItemsChecked('documents_checked', userId);
    const generalItemsChecked = await userChecklistItemsChecked('general_checked', userId);
    const toiletriesItemsChecked = await userChecklistItemsChecked('toiletries_checked', userId);
    const clothesItemsChecked = await userChecklistItemsChecked('clothes_checked', userId);
    const medicineItemsChecked = await userChecklistItemsChecked('medicine_checked', userId);
    const ToDoItemsChecked = await userChecklistItemsChecked('ToDo_checked', userId);

    res.render('checklist', {
      title: 'Checklists',
      userId,
      getFirstWord,
      authenticated: true,
      docsItems, generalItems, toiletriesItems, clothesItems, medicineItems, ToDoItems,
      docsItemsChecked, generalItemsChecked, toiletriesItemsChecked, clothesItemsChecked, medicineItemsChecked, ToDoItemsChecked
    });
  } else {
    const docsItems = await getChecklistItems('documents');
    const generalItems = await getChecklistItems('general');
    const toiletriesItems = await getChecklistItems('toiletries');
    const clothesItems = await getChecklistItems('clothes');
    const medicineItems = await getChecklistItems('medicine');
    const ToDoItems = await getChecklistItems('ToDo');

    const docsItemsChecked = await getChecklistItems('documents_checked');
    const generalItemsChecked = await getChecklistItems('general_checked');
    const toiletriesItemsChecked = await getChecklistItems('toiletries_checked');
    const clothesItemsChecked = await getChecklistItems('clothes_checked');
    const medicineItemsChecked = await getChecklistItems('medicine_checked');
    const ToDoItemsChecked = await getChecklistItems('ToDo_checked');
    res.render('checklist', { 
      title: 'Checklists',
      getFirstWord,
      authenticated: false,
      docsItems, generalItems, toiletriesItems, clothesItems, medicineItems, ToDoItems,
      docsItemsChecked, generalItemsChecked, toiletriesItemsChecked, clothesItemsChecked, medicineItemsChecked, ToDoItemsChecked
    });
  }
};
  
async function insertItemIntoTable(req, res, table) {
  const userId = req.session.userId;
  const newItem = req.body.newItem;
  const query = `INSERT INTO ${table} (item, user_id) VALUES (?, ?)`;
  const conn = await pool.getConnection();
  const [result, fields] = await conn.execute(query, [newItem, userId]);
  conn.release();

  // Render the 'checklist' view with the updated data
  await renderChecklistView(req, res);
}
  
async function deleteItemFromTable(req, res, table) {
  const userId = req.session.userId;
  const id = req.params.id;
  const query = `INSERT INTO ${table}_removed (id, user_id) VALUES (?, ?)`;
  const conn = await pool.getConnection();
  const [result, fields] = await conn.execute(query, [id, userId]);
  conn.release();

  // Render the 'checklist' view with the updated data
  await renderChecklistView(req, res);
}
  
async function userChecklistItems(tableName, userId) {
  const conn = await pool.getConnection();
  const query = `SELECT ${tableName}.id, ${tableName}.item 
  FROM ${tableName} 
  WHERE (${tableName}.user_id = ? OR ${tableName}.user_id = 'default') 
    AND ${tableName}.id NOT IN (
      SELECT ${tableName}_removed.id 
      FROM ${tableName}_removed 
      WHERE ${tableName}_removed.user_id = ?
    ) AND ${tableName}.id NOT IN (
        SELECT ${tableName}_checked.id 
        FROM ${tableName}_checked 
        WHERE ${tableName}_checked.user_id = ?)`;
  const [rows, fields] = await conn.query(query, [userId, userId, userId]);
  conn.release();
  return rows.map(row => { return {id: row.id, item: row.item} });
};

async function userChecklistItemsChecked(tableName, userId) {
  const conn = await pool.getConnection();
  const query = `SELECT ${tableName}.id, ${tableName}.item 
    FROM ${tableName} 
    WHERE (${tableName}.user_id = ? OR ${tableName}.user_id = 'default')`;
  const [rows, fields] = await conn.query(query, [userId]);
  conn.release();
  return rows.map(row => { return {id: row.id, item: row.item} });
};

module.exports = { insertItemIntoTable, deleteItemFromTable, renderChecklistView };

