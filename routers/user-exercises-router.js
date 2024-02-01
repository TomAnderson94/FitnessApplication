import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildUserExercisesSelectSql = (id, variant) => {
    let sql = '';
    let table = 'UserExercises';
    let fields = ['UserExerciseID', 'UserUserID', 'ExerciseExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];
  
    switch (variant) {
      default:
        sql = `SELECT ${fields.join(', ')} FROM ${table}`;
        if (id) sql += ` WHERE UserUserID=${id}`;
    }
  
    return sql;
  };
  
  const buildUserExerciseDeleteSql = (userExerciseId, userUserId) => {
    const table = 'UserExercises';
    let sql = `DELETE FROM ${table} WHERE UserExerciseID = ? AND UserUserID = ?`;
    const values = [userExerciseId, userUserId];
    return { sql, values };
  };
  
  const buildUserExerciseInsertSql = () => {
    let table = 'UserExercises';
    let fields = ['UserUserID', 'ExerciseExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];
    let placeholders = fields.map(() => '?').join(', ');
    return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
  };

// Data Accessors ----------------------------------------


// Controllers -------------------------------------------

const recordUserExerciseController = async (req, res) => {
    try {
      // Hardcoded UserUserID for testing purposes ('1' represents an actual ID from the Users table)
      const UserUserID = 1;
      const {
        ExerciseExerciseID,
        Weight,
        Reps,
        Sets,
        Date,
      } = req.body;

    // Validate the incoming data
    if (!ExerciseExerciseID || !Weight || !Reps || !Sets || !Date) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
    // Validate weight data as a number only
    if (typeof Weight !== 'number') {
        return res.status(400).json({ message: 'Weight must be a number' });
      }
    
      const sql = buildUserExerciseInsertSql();
      const result = await database.query(sql, [
        UserUserID,
        ExerciseExerciseID,
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

const userExercisesController = async (req, res) => {
  console.log("there:");
  console.log(req.params)
  const id = req.params.UserUserID; 
  console.log(id);
  
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

const allUserExercisesController = async (req, res) => {
 // const sql = 'SELECT * FROM UserExercises';
  const table = 'UserExercises';
  //const whereField = 'UserUserID';
  const fields = ['UserExerciseID', 'UserUserID', 'ExerciseExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];
 // const extendedTable = `${table} JOIN Exercises ON UserExercises.ExerciseExerciseID=Exercises.ExerciseID`;
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

const updateExerciseRecordController = async (req, res) => {
  try {    console.log('Body: ', req.body);
console.log('Params: ', req.params);
    const UserExerciseID = req.params.UserExerciseID;
 //   const UserUserID = req.params.UserUserID; 

    const {
      UserUserID,
      ExerciseExerciseID,
      Weight,
      Reps,
      Sets,
      Date,
    } = req.body;
    console.log(`message body:[${JSON.stringify(req.body)}]`);
    console.log(ExerciseExerciseID);
    console.log(Weight);
    console.log(Reps);
    console.log(Sets);


    // Validate the incoming data
    if (UserUserID === undefined || !ExerciseExerciseID || !Weight || !Reps || !Sets || !Date) {
      return res.status(400).json({ message: 'Missing required fields really' });
    }

    // Validate weight data as a number only
    if (typeof Weight !== 'number') {
      return res.status(400).json({ message: 'Weight must be a number' });
    }

    const sql = `UPDATE UserExercises 
                 SET ExerciseExerciseID = ?, Weight = ?, Reps = ?, Sets = ?, Date = ? 
                 WHERE UserExerciseID = ? AND UserUserID = ?`;
    const result = await database.query(sql, [
      ExerciseExerciseID,
      Weight,
      Reps,
      Sets,
      Date,
      UserExerciseID,
      UserUserID,
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
    const UserUserID = req.params.UserUserID; 
    console.log('Delete Params: ', req.params);


    // Validate the incoming data ensuring the IDs are provided
    if (!UserExerciseID || !UserUserID) {
      return res.status(400).json({ message: 'Missing required IDs' });
    }
    // Build SQL
    const { sql, values } = buildUserExerciseDeleteSql(UserExerciseID, UserUserID);

    const result = await database.query(sql, [UserExerciseID, UserUserID]);

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

router.get('/', allUserExercisesController);
router.get('/:UserUserID', userExercisesController);
router.post('/', recordUserExerciseController);

router.put('/:UserExerciseID/:UserUserID', updateExerciseRecordController);
router.delete('/:UserExerciseID/:UserUserID', deleteUserExerciseRecordController);


export default router;
