const express = require('express');
const mysql = require('mysql2');
const methodOverride = require('method-override');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const fs = require('fs');
const isEmpty = require('lodash/isEmpty');
const path = require('path');
const bcrypt = require('bcrypt');
const { insertItemIntoTable, deleteItemFromTable, renderChecklistView } = require('./checklist');

const app = express();
const port = 3000;

const pool = require('./db');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(cookieParser());
app.use(session({
  secret: 'sthrth565h6s2hrt6',
  resave: false,
  saveUninitialized: true,
}));


app.get('/', async (req, res) => {
  try {
    if (req.session.userId) {
      const conn = await pool.getConnection();
      const [[user]] = await conn.execute('SELECT * FROM users WHERE id = ?', [req.session.userId]);
      conn.release();
      res.render('index', { authenticated: true, user });
    } else {
      res.render('index', { authenticated: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});


app.post('/messages', (req, res) => {
  const { message, email } = req.body;
  const userId = req.session.userId;

  try {
    const data = fs.readFileSync(path.join(__dirname, 'messages.json'));
    let messages = JSON.parse(data);
    messages.push({ email, message, userId });
    fs.writeFileSync(path.join(__dirname, 'messages.json'), JSON.stringify(messages, null, 2));
    res.redirect('/?message=Email+Sent');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});


app.get('/register', (req, res) => {
  res.render('register', { errorMsg: '' });
});


app.post('/register', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const passwordConfirmation = req.body.passwordConfirmation;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const conn = await pool.getConnection();
  const selectQuery = `SELECT EXISTS(SELECT * FROM users WHERE email = ?)`;
  const [rows, fields] = await conn.execute(selectQuery, [email]);
  if (rows[0][`EXISTS(SELECT * FROM users WHERE email = ?)`] === 1) {
    res.render('register', {errorMsg: 'Email already exists'});
  } else if (password !== passwordConfirmation) {
    res.render('register', {errorMsg: 'Passwords do not match'});
    } else {
    const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
    await conn.execute(insertQuery, [email, hashedPassword]);
    const [[newUser]] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    req.session.userId = newUser.id;
    res.redirect('/');
  }
  conn.release();
});


app.get('/signin', (req, res) => {
  res.render('signin', { errorMsg: '' });
});


app.post('/signin', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const conn = await pool.getConnection();
  const selectQuery = `SELECT * FROM users WHERE email = ?`;
  const [rows, fields] = await conn.execute(selectQuery, [email]);
  if (rows.length === 0) {
    res.render('signin', { errorMsg: 'Invalid email', email: email });
  } else {
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      res.cookie('userId', user.id);
      res.render('index', { authenticated: true });
    } else {
      res.render('signin', { errorMsg: 'Invalid password', email: email });
    }
  }
  conn.release();
});


app.get('/checklist', renderChecklistView);


app.post('/checklist/:table/:id', (req, res) => {
  const { table, id } = req.params;

  if (['documents', 'general', 'toiletries', 'clothes', 'medicine', 'ToDo'].includes(table)) {
    insertItemIntoTable(req, res, table);
  } else {
    res.status(400).send('Invalid table name.');
  }
});


app.post('/checklist/api/moveItem/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const userId = req.session.userId;
    const { itemId, item } = req.body;
    const conn = await pool.getConnection();
    const query = `INSERT INTO ${table}_checked (id, item, user_id) VALUES (?, ?, ?)`;
    await conn.execute(query, [itemId, item, userId]);
    conn.release();
    res.json({ success: true, message: 'Item moved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});


app.post('/checklist/updateChecklist', async (req, res) => {
  try {
    const userId = req.session.userId;
    const conn = await pool.getConnection();

    const tableData = [
      { table: 'documents', checkedTable: 'documents_checked' },
      { table: 'general', checkedTable: 'general_checked' },
      { table: 'toiletries', checkedTable: 'toiletries_checked' },
      { table: 'clothes', checkedTable: 'clothes_checked' },
      { table: 'medicine', checkedTable: 'medicine_checked' },
      { table: 'ToDo', checkedTable: 'ToDo_checked' },
    ];

    for (const table of tableData) {
      const query = `
        INSERT INTO ${table.table} (id, item, user_id)
        SELECT c.id, c.item, c.user_id
        FROM ${table.checkedTable} c
        LEFT JOIN ${table.table} d ON c.id = d.id
        WHERE c.user_id = ? AND d.id IS NULL
      `;
      const removeQuery = `DELETE FROM ${table.checkedTable} WHERE user_id = ?`;
      await conn.execute(query, [userId]);
      await conn.execute(removeQuery, [userId]);
    }

    conn.release();
    await renderChecklistView(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});


app.delete('/checklist/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  if (['documents', 'general', 'toiletries', 'clothes', 'medicine', 'ToDo'].includes(table)) {
    deleteItemFromTable(req, res, table);
  } else {
    res.status(400).send('Invalid table name.');
  }
});


app.get('/itinerary', async (req, res) => {
  if (req.session.userId) {
    const userId = req.session.userId;
    const conn = await pool.getConnection();
    const [rows, fields] = await conn.query(`SELECT * FROM itinerary WHERE user_id = ${userId}`);
    conn.release();

    const data = rows.map(row => { return {id: row.id, date: row.date, city: row.city, comments: row.comments} 
    });

    res.render('itinerary', { 
      title: 'Itinerary',
      authenticated: true,
      data: data
    });
  } else {
    res.render('itinerary', {
      authenticated: false,
    });
  }
});


app.post('/itinerary', async(req, res) => {
    const userId = req.session.userId;
    const newDate = req.body.newDate;
    const newCity = req.body.newCity;
    const newComments = req.body.newComments;
    const query = `INSERT INTO itinerary (date, city, comments, user_id) VALUES (?, ?, ?, ?)`;
    const conn = await pool.getConnection();
    const [result, fields] = await conn.execute(query, [newDate, newCity, newComments, userId]);
    conn.release();
    res.redirect('/itinerary');
});


app.post('/itinerary/:id/delete', async (req, res) => {
  const userId = req.session.userId;
  const id = req.params.id;
  const query = `DELETE FROM itinerary WHERE id = ? AND user_id = ?`;
  const conn = await pool.getConnection();
  const [result, fields] = await conn.execute(query, [id, userId]);
  conn.release();
  res.redirect('/itinerary');
});


app.get('/budget', async (req, res) => {
  if (req.session.userId) {
    const userId = req.session.userId;
    const errorMessage = req.query.errorMessage;
    const conn = await pool.getConnection();
    const [rows, fields] = await conn.query(`SELECT * FROM budget WHERE user_id = ${userId}`);
    const data = rows.map(row => { return {id: row.id, description: row.description, category: row.category, quantity: row.quantity, unit_cost: row.unit_cost, total: row.total} 
    });

    const [result] = await conn.query(`SELECT SUM(total) AS grandTotal FROM budget WHERE user_id = ${userId}`);
    const grandTotal = result[0].grandTotal;

    conn.release();

    res.render('budget', { 
      title: 'Budget',
      authenticated: true,
      data: data,
      userId: userId,
      grandTotal: grandTotal,
      errorMessage: errorMessage
    });
  } else {
    res.render('budget', {
      authenticated: false,
    });
  }
});


app.post('/budget', async (req, res) => {
  const userId = req.session.userId;
  const newDescription = req.body.newDescription;
  const newCategory = req.body.newCategory;
  const newQuantity = req.body.newQuantity;
  const newUnit_cost = req.body.newUnit_cost;
  const newTotal = req.body.newTotal;

  // Error messages
  let errorMessage = null;

  if (!isNumeric(newQuantity) || !isNumeric(newUnit_cost)) {
    errorMessage = 'Quantity and Unit Cost must be numeric values.';
  } else if (isEmpty(newDescription)) {
    errorMessage = 'Description cannot be empty.';
  } else if (isEmpty(newCategory)) {
    errorMessage = 'Category cannot be empty.';
  }
  
  if (errorMessage) {
    res.redirect('/budget?errorMessage=' + encodeURIComponent(errorMessage));
    return;
  }
  
  const query = `INSERT INTO budget (description, category, quantity, unit_cost, user_id, total) VALUES (?, ?, ?, ?, ?, ?)`;
  const conn = await pool.getConnection();
  const [result, fields] = await conn.execute(query, [newDescription, newCategory, newQuantity, newUnit_cost, userId, newTotal]);
  conn.release();
  res.redirect('/budget');
});

function isNumeric(value) {
  return /^-?\d+\.?\d*$/.test(value);
}


app.post('/budget/:id/delete', async (req, res) => {
  const userId = req.session.userId;
  const id = req.params.id;
  const query = `DELETE FROM budget WHERE id = ? AND user_id = ?`;
  const conn = await pool.getConnection();
  const [result, fields] = await conn.execute(query, [id, userId]);
  conn.release();
  res.redirect('/budget');
});

app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;

