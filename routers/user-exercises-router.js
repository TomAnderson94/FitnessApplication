import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildUserExerciseInsertSql = () => {
  let table = 'UserExercises';
  let fields = ['UserID', 'ExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];
  let placeholders = fields.map(() => '?').join(', ');
  return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
};

const buildUserExercisesSelectSql = (id, variant) => {
  let sql = '';
  let table = 'UserExercises';
  let fields = ['UserExerciseID', 'UserID', 'ExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];

  switch (variant) {
    default:
      sql = `SELECT ${fields.join(', ')} FROM ${table}`;
      if (id) sql += ` WHERE UserID=${id}`;
      sql += ` ORDER BY Date DESC`;
  }
  return sql;
};

const buildUserExercisesUpdateSql = (ExerciseID, Weight, Reps, Sets, Date, UserExerciseID, UserID) => {
  let table = 'UserExercises';
  let fieldsToUpdate = [
      'ExerciseID = ?',
      'Weight = ?',
      'Reps = ?',
      'Sets = ?',
      'Date = ?'
  ];
  let conditions = 'UserExerciseID = ? AND UserID = ?';

  let sql = `UPDATE ${table} SET ${fieldsToUpdate.join(', ')} WHERE ${conditions}`;
  let values = [ExerciseID, Weight, Reps, Sets, Date, UserExerciseID, UserID];

  return { sql, values };
};

const buildUserExerciseDeleteSql = (userExerciseId, userUserId) => {
  let table = 'UserExercises';
  let sql = `DELETE FROM ${table} WHERE UserExerciseID = ? AND UserID = ?`;
  const values = [userExerciseId, userUserId];
  return { sql, values };
};


// Controllers -------------------------------------------

const createUserExercisesController = async (req, res) => {
  try {
    const UserID = 1; // Hard coded for demonstration purposes
    const {
      ExerciseID,
      Weight,
      Reps,
      Sets,
      Date,
    } = req.body;

  // Validate the incoming data
  if (!ExerciseID || !Weight || !Reps || !Sets || !Date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  // Validate weight data as a number only
  if (typeof Weight !== 'number') {
      return res.status(400).json({ message: 'Weight must be a number' });
    }
  
    const sql = buildUserExerciseInsertSql();
    const result = await database.query(sql, [
      UserID,
      ExerciseID,
      Weight,
      Reps,
      Sets,
      Date,
    ]);

    if (result[0].affectedRows === 1) {
      res.status(201).json({ message: 'Exercise recorded successfully' });
    } else {
      res.status(400).json({ message: 'Failed to record exercise' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.toString() });
  }
};

const readUserExercisesController = async (req, res) => {
  console.log(req.params)
  const id = req.params.UserID; 
  console.log("id = ", id);
  
  const sql = buildUserExercisesSelectSql(id, null);
  console.log("SQL :", sql);
  try {
    const [results] = await database.query(sql, [id]);
    if (results.length === 0) {
      res.status(404).json({ message: 'No record found with the given ID' });
    } else {
      res.status(200).json(results);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const readAllUserExercisesController = async (req, res) => {
  const table = 'UserExercises';
  const fields = ['UserExerciseID', 'UserID', 'ExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];
  const sql = `SELECT ${fields} FROM ${table} `;
  console.log(sql);
  try {
    const [results] = await database.query(sql);
    if (results.length === 0) {
      res.status(404).json({ message: 'No exercises found' });
    } else {
      res.status(200).json(results);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateUserExercisesController = async (req, res) => {
  try {    
    console.log('Body: ', req.body);
    console.log('Params: ', req.params);
    const UserExerciseID = req.params.UserExerciseID;
    const {
      UserID,
      ExerciseID,
      Weight,
      Reps,
      Sets,
      Date,
    } = req.body;
    console.log(`message body:[${JSON.stringify(req.body)}]`);
    console.log("ID: ", ExerciseID);
    console.log("Weight: ", Weight);
    console.log("Reps: ", Reps);
    console.log("Sets: ", Sets);

    // Validate the incoming data
    if (UserID === undefined || !ExerciseID || !Weight || !Reps || !Sets || !Date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate weight data as a number only
    if (typeof Weight !== 'number') {
      return res.status(400).json({ message: 'Weight must be a number' });
    }

    const sql = buildUserExercisesUpdateSql(ExerciseID, Weight, Reps, Sets, Date, UserExerciseID, UserID);
    const result = await database.query(sql, [
      ExerciseID,
      Weight,
      Reps,
      Sets,
      Date,
      UserExerciseID,
      UserID,
    ]);

    if (result[0].affectedRows === 1) {
      res.status(200).json({ message: 'Exercise record updated successfully' });
    } else {
      res.status(400).json({ message: 'Failed to update exercise record' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.toString(), error: error.message });
  }
};

const deleteUserExerciseRecordController = async (req, res) => {
  try {
    const UserExerciseID = req.params.UserExerciseID;
    const UserID = req.params.UserID; 
    console.log('Delete Params: ', req.params);

    // Validate the incoming data ensuring the IDs are provided
    if (!UserExerciseID || !UserID) {
      return res.status(400).json({ message: 'Missing required IDs' });
    }
    // Build SQL
    const sql = buildUserExerciseDeleteSql(UserExerciseID, UserID);
    const result = await database.query(sql, [UserExerciseID, UserID]);

    if (result[0].affectedRows === 1) {
      res.status(200).json({ message: 'Exercise record deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete exercise record or record not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Endpoints ---------------------------------------------

router.get('/', readAllUserExercisesController);
router.get('/:UserID', readUserExercisesController);
router.post('/', createUserExercisesController);

router.put('/:UserExerciseID/:UserID', updateUserExercisesController);
router.delete('/:UserExerciseID/:UserID', deleteUserExerciseRecordController);


export default router;
