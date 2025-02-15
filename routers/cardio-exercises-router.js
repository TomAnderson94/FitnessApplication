import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildCardioExerciseInsertSql = () => {
  let table = 'CardioExercises';
  let fields = ['UserID', 'ExerciseID', 'Duration', 'Distance', 'AdditionalInfo', 'Date'];
  let placeholders = fields.map(() => '?').join(', ');
  return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
};

const buildCardioExercisesSelectSql = (id, variant) => {
  let sql = '';
  let table = 'CardioExercises';
  let fields = ['CardioExerciseID', 'UserID', 'ExerciseID', 'Duration', 'Distance', 'AdditionalInfo', 'Date'];

  switch (variant) {
      default:
          sql = `SELECT ${fields.join(', ')} FROM ${table}`;
          if (id) sql += ` WHERE UserID=${id}`;
          sql += ` ORDER BY Date DESC`;
  }
  return sql;
};

const buildCardioExerciseUpdateSql = (ExerciseID, Duration, Distance, AdditionalInfo, Date, CardioID, UserID) => {
  let table = 'CardioExercises';
  let fieldsToUpdate = [
    'ExerciseID = ?',
    'Duration = ?',
    'Distance = ?',
    'AdditionalInfo = ?',
    'Date = ?'
  ];
  let conditions = 'CardioExerciseID = ? AND UserID = ?';

  let sql = `UPDATE ${table} SET ${fieldsToUpdate.join(', ')} WHERE ${conditions}`;
  let values = [ExerciseID, Duration, Distance, AdditionalInfo, Date, CardioID, UserID];

  return { sql, values };
};
  
const buildCardioExerciseDeleteSql = (cardioExerciseId, userId) => {
  const table = 'CardioExercises';
  let sql = `DELETE FROM ${table} WHERE CardioExerciseID = ? AND UserID = ?`;
  const values = [cardioExerciseId, userId];
  return { sql, values };
};

// Controllers -------------------------------------------

const createCardioExerciseController = async (req, res) => {
  try {
      // Hardcoded UserID for demonstration purposes ('1' represents an actual ID from the Users table)
      const userId = 1;
      const {
          ExerciseID,
          Duration,
          Distance,
          AdditionalInfo,
          Date,
      } = req.body;
      console.log("cardio body is : ", req.body);

      // Validate the incoming data
      if (!ExerciseID || !Duration || !Distance || !Date) {
          return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate Duration and Distance data as numbers only
      if (typeof Duration !== 'number' || typeof Distance !== 'number') {
          return res.status(400).json({ message: 'Duration and Distance must be numbers' });
      }

      const sql = buildCardioExerciseInsertSql();
      const result = await database.query(sql, [
          userId,
          ExerciseID,
          Duration,
          Distance,
          AdditionalInfo,
          Date,
      ]);

      if (result[0].affectedRows === 1) {
          res.status(201).json({ message: 'Cardio exercise recorded successfully' });
      } else {
          res.status(400).json({ message: 'Failed to record cardio exercise' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.toString() });
  }
};

const readAllCardioExercisesController = async (req, res) => {
  console.log("cardio params: ", req.params);
  const sql = buildCardioExercisesSelectSql(null, null);
  try {
      const [results] = await database.query(sql);
      if (results.length === 0) {
          res.status(404).json({ message: 'No cardio exercises found' });
      } else {
          res.status(200).json(results);
      }
  } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateCardioExercisesController = async (req, res) => {
  try {    
    const CardioExerciseID = req.params.CardioExerciseID;
    const UserID = req.params.UserID;
    const {
      ExerciseID,
      Duration,
      Distance,
      AdditionalInfo,
      Date,
    } = req.body;
    console.log(`message body:[${JSON.stringify(req.body)}]`);
    console.log('Duration: ', Duration, 'Distance: ', Distance, 'AdditionalInfo: ', AdditionalInfo);

    // Validate the incoming data
    if (UserID === undefined || !ExerciseID || !Duration || !Distance || !AdditionalInfo || !Date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate Duration data as a number only
    if (typeof Duration !== 'number') {
      return res.status(400).json({ message: 'Duration must be a number' });
    }

    const sql = buildCardioExerciseUpdateSql(ExerciseID, Duration, Distance, AdditionalInfo, Date, CardioExerciseID, UserID);

    const result = await database.query(sql, [
      ExerciseID,
      Duration,
      Distance,
      AdditionalInfo,
      Date,
      CardioExerciseID,
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

const deleteCardioExerciseController = async (req, res) => {
  try {
    const CardioExerciseID = req.params.CardioExerciseID;
    const UserID = req.params.UserID; 
    console.log('Delete Params: ', req.params);

    // Validate the incoming data ensuring the IDs are provided
    if (!CardioExerciseID || !UserID) {
      return res.status(400).json({ message: 'Missing required IDs' });
    }
    // Build SQL
    const sql = buildCardioExerciseDeleteSql(CardioExerciseID, UserID);
    const result = await database.query(sql, [CardioExerciseID, UserID]);

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

router.get('/', readAllCardioExercisesController);
router.post('/', createCardioExerciseController);
router.put('/:CardioExerciseID/:UserID', updateCardioExercisesController);
router.delete('/:CardioExerciseID/:UserID', deleteCardioExerciseController)

export default router;
