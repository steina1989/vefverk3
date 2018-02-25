
const { Client } = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:123@localhost/postgres';

/**
 * Create a note asynchronously.
 *
 * @param {Object} note - Note to create
 * @param {string} note.title - Title of note
 * @param {string} note.text - Text of note
 * @param {string} note.datetime - Datetime of note
 *
 * @returns {Promise} Promise representing the object result of creating the note
 */
async function create({ title, text, datetime } = {}) {
  const result = await query('INSERT INTO notes (title,text,datetime) VALUES($1,$2,$3) RETURNING *', [title, text, datetime]);
  return result.rows
}

/**
 * Read all notes.
 *
 * @returns {Promise} Promise representing an array of all note objects
 */
async function readAll() {

  const result = await query('SELECT * FROM notes');
  return result.rows;
}

/**
 * Read a single note.
 *
 * @param {number} id - Id of note
 *
 * @returns {Promise} Promise representing the note object or null if not found
 */
async function readOne(id) {
  const result = await query('SELECT * FROM notes WHERE id = ($1)',[id])
  if (result.rows.length === 0){
    return null
  } else {
    return result.rows;
  }
}

/**
 * Update a note asynchronously.
 *
 * @param {number} id - Id of note to update
 * @param {Object} note - Note to create
 * @param {string} note.title - Title of note
 * @param {string} note.text - Text of note
 * @param {string} note.datetime - Datetime of note
 *
 * @returns {Promise} Promise representing the object result of creating the note
 */
async function update(id, { title, text, datetime } = {}) {
  const result = await query('UPDATE notes SET title=($1),text=($2),datetime=($3) WHERE id = ($4) RETURNING *', [title, text, datetime,id]);
  return {
    success : result.rowCount === 1,
    rows : result.rows
  } 
}

/**
 * Delete a note asynchronously.
 *
 * @param {number} id - Id of note to delete
 *
 * @returns {Promise} Promise representing the boolean result of creating the note
 */
async function del(id) {
  const result = await query('DELETE FROM notes WHERE id = ($1)', [id])
  if (result.rowCount===1){
    return true;
  }
  else return false;
}

async function query(string,data){
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const result = await client.query(string,data);
    return result;
  } catch (err) {
    console.error('SQL error');
    throw err;
  } finally {
    await client.end();
  }
}

module.exports = {
  create,
  readAll,
  readOne,
  update,
  del,
};
