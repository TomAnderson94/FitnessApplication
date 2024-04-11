import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildStretchingExerciseInsertSql = () => {
  let table = 'StretchingExercises';
  let fields = ['UserID', 'StretchingBodyPart', 'Duration', 'Sets', 'AdditionalInfo', 'Date'];
  let placeholders = fields.map(() => '?').join(', ');
  return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
};

const buildStretchingExercisesSelectSql = (id, variant) => {
  let sql = '';
  let table = 'StretchingExercises';
  let fields = ['StretchingID', 'UserID', 'StretchingBodyPart', 'Duration', 'Sets', 'AdditionalInfo', 'Date'];

  switch (variant) {
      default:
          sql = `SELECT ${fields.join(', ')} FROM ${table}`;
          if (id) sql += ` WHERE UserID=${id}`;
          sql += ` ORDER BY Date DESC`;
  }
  return sql;
};

const buildStretchingExerciseUpdateSql = (StretchingBodyPart, Duration, Sets, AdditionalInfo, Date, StretchingID, UserID) => {
  let table = 'StretchingExercises';
  let fieldsToUpdate = [
    'StretchingBodyPart = ?',
    'Duration = ?',
    'Sets = ?',
    'AdditionalInfo = ?',
    'Date = ?'
  ];
  let conditions = 'StretchingID = ? AND UserID = ?';

  let sql = `UPDATE ${table} SET ${fieldsToUpdate.join(', ')} WHERE ${conditions}`;
  let values = [StretchingBodyPart, Duration, Sets, AdditionalInfo, Date, StretchingID, UserID];

  return { sql, values };
};
  
const buildStretchingExerciseDeleteSql = (stretchingExerciseId, userId) => {
  const table = 'StretchingExercises';
  let sql = `DELETE FROM ${table} WHERE StretchingID = ? AND UserID = ?`;
  const values = [stretchingExerciseId, userId];
  return { sql, values };
};

// Controllers -------------------------------------------

const createStretchingExerciseController = async (req, res) => {
  try {
      // Hardcoded UserID for demonstration purposes ('1' represents an actual ID from the Users table)
      const UserId = 1;
      const {
          StretchingBodyPart,
          Duration,
          Sets,
          AdditionalInfo,
          Date,
      } = req.body;

      // Validate the incoming data
      if (!StretchingBodyPart || !Duration || !Sets || !Date) {
          return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate Duration and Sets data as numbers only
      if (typeof Duration !== 'number' || typeof Sets !== 'number') {
          return res.status(400).json({ message: 'Duration and Sets must be numbers' });
      }

      const sql = buildStretchingExerciseInsertSql();
      const result = await database.query(sql, [
          UserId,
          StretchingBodyPart,
          Duration,
          Sets,
          AdditionalInfo,
          Date,
      ]);

      if (result[0].affectedRows === 1) {
          res.status(201).json({ message: 'Stretching exercise recorded successfully' });
      } else {
          res.status(400).json({ message: 'Failed to record stretching exercise' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.toString() });
  }
};

const readStretchingExercisesController = async (req, res) => {
  const id = req.params.UserID;
  const sql = buildStretchingExercisesSelectSql(id, null);
  console.log("read all stretch params: ", req.params);

  try {
      const [results] = await database.query(sql, [id]);
      if (results.length === 0) {
          res.status(404).json({ message: 'No stretching exercises found' });
      } else {
          res.status(200).json(results);
      }
  } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateStretchingExercisesController = async (req, res) => {
  try {    
    const StretchingID = req.params.StretchingID;
    const UserID = req.params.UserID;
    const {
      StretchingBodyPart,
      Duration,
      Sets,
      AdditionalInfo,
      Date,
    } = req.body;

    // Validate the incoming data
    if (!StretchingID || !UserID || !StretchingBodyPart || !Duration || !Sets || !AdditionalInfo || !Date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate Duration and Sets data as numbers only
    if (typeof Duration !== 'number' || typeof Sets !== 'number') {
      return res.status(400).json({ message: 'Duration and Sets must be numbers' });
    }

    const sql = buildStretchingExerciseUpdateSql(StretchingBodyPart, Duration, Sets, AdditionalInfo, Date, StretchingID, UserID);

    const result = await database.query(sql, [
      StretchingBodyPart,
      Duration,
      Sets,
      AdditionalInfo,
      Date,
      StretchingID,
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

const deleteStretchingExerciseController = async (req, res) => {
  try {
    const StretchingID = req.params.StretchingID;
    const UserID = req.params.UserID; 

    // Validate the incoming data ensuring the IDs are provided
    if (!StretchingID || !UserID) {
      return res.status(400).json({ message: 'Missing required IDs' });
    }
    // Build SQL
    const sql = buildStretchingExerciseDeleteSql(StretchingID, UserID);
    const result = await database.query(sql, [StretchingID, UserID]);

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

router.get('/:UserID', readStretchingExercisesController);
router.post('/', createStretchingExerciseController);
router.put('/:StretchingID/:UserID', updateStretchingExercisesController);
router.delete('/:StretchingID/:UserID', deleteStretchingExerciseController)

export default router;
