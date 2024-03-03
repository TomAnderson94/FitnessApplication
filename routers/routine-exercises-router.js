import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildRoutineExerciseInsertSql = () => {
    let table = 'RoutineExercises';
    let fields = ['RoutinesID', 'ExerciseID', '`Order`', 'CustomWeight', 'CustomReps', 'CustomSets', 'CustomDuration', 'CustomDistance', 'CustomAdditionalInfo'];
    let placeholders = fields.map(() => '?').join(', ');
    return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
};

const buildRoutineExercisesSelectSql = (id, variant) => {
    let sql = '';
    let table = 'RoutineExercises';
    let fields = ['RoutineExerciseID', 'RoutinesID', 'ExerciseID', '`Order`', 'CustomWeight', 'CustomReps', 'CustomSets', 'CustomDuration', 'CustomDistance', 'CustomAdditionalInfo'];

    switch (variant) {
        default:
            sql = `SELECT ${fields.join(', ')} FROM ${table}`;
            if (id) sql += ` WHERE RoutinesID=${id}`;
    }

    return sql;
};

const buildRoutineExercisesUpdateSql = (ExerciseID, Order, CustomWeight, CustomReps, CustomSets, CustomDuration, CustomDistance, CustomAdditionalInfo, RoutineExerciseID, RoutinesID) => {
    let table = 'RoutineExercises';
    let fieldsToUpdate = [
        'ExerciseID = ?',
        'Order = ?',
        'CustomWeight = ?',
        'CustomReps = ?',
        'CustomSets = ?',
        'CustomDuration = ?',
        'CustomDistance = ?',
        'CustomAdditionalInfo = ?'
    ];
    let conditions = 'RoutineExerciseID = ? AND RoutinesID = ?';
  
    let sql = `UPDATE ${table} SET ${fieldsToUpdate.join(', ')} WHERE ${conditions}`;
    let values = [ExerciseID, Order, CustomWeight, CustomReps, CustomSets, CustomDuration, CustomDistance, CustomAdditionalInfo, RoutineExerciseID, RoutinesID];
  
    return { sql, values };
  };
  
const buildRoutineExerciseDeleteSql = (routineExerciseId, routineId) => {
    const table = 'RoutineExercises';
    let sql = `DELETE FROM ${table} WHERE RoutineExerciseID = ? AND RoutinesID = ?`;
    const values = [routineExerciseId, routineId];
    return { sql, values };
};



// Controllers -------------------------------------------

const createRoutineExerciseController = async (req, res) => {
    try {
        const {
            RoutinesID,
            ExerciseID,
            Order,
            CustomWeight,
            CustomReps,
            CustomSets,
            CustomDuration,
            CustomDistance,
            CustomAdditionalInfo
        } = req.body;

        // Validate the incoming data
        if (!RoutinesID || !ExerciseID || !Order) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Perform additional validation if needed

        const sql = buildRoutineExerciseInsertSql();
        const result = await database.query(sql, [
            RoutinesID,
            ExerciseID,
            Order,
            CustomWeight || null,
            CustomReps || null,
            CustomSets || null,
            CustomDuration || null,
            CustomDistance || null,
            CustomAdditionalInfo || null
        ]);

        if (result[0].affectedRows === 1) {
            res.status(201).json({ message: 'Routine exercise recorded successfully' });
        } else {
            res.status(400).json({ message: 'Failed to record routine exercise' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.toString() });
    }
};

const readAllRoutineExercisesController = async (req, res) => {
    console.log("routine exercises params: ", req.params);
    const id = req.params.RoutinesID;
    
    const sql = buildRoutineExercisesSelectSql(id, null);
    try {
        const [results] = await database.query(sql, [id]);
        if (results.length === 0) {
            res.status(404).json({ message: 'No routine exercises found' });
        } else {
            res.status(200).json(results);
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const updateRoutineExercisesController = async (req, res) => {
    try {    
      console.log('Body: ', req.body);
      console.log('Params: ', req.params);
      const RoutineExerciseID = req.params.RoutineExerciseID;
      const {
        RoutinesID,
        ExerciseID,
        Order,
        CustomWeight,
        CustomReps,
        CustomSets,
        CustomDuration,
        CustomDistance,
        CustomAdditionalInfo
      } = req.body;
      console.log(`message body:[${JSON.stringify(req.body)}]`);
      console.log("Routines ID: ", RoutinesID);
      console.log("Order: ", Order);  
  
      // Validate the incoming data
      if (RoutinesID === undefined || !ExerciseID || !Order) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Validate weight data as a number only
      if (typeof Order !== 'number') {
        return res.status(400).json({ message: 'Order must be a number' });
      }
  
      const sql = buildRoutineExercisesUpdateSql(ExerciseID, Order, CustomWeight, CustomReps, CustomSets, CustomDuration, CustomDistance, CustomAdditionalInfo, RoutineExerciseID, RoutinesID);
      const result = await database.query(sql, [
        ExerciseID,
        Order,
        CustomWeight,
        CustomReps,
        CustomSets,
        CustomDuration,
        CustomDistance,
        CustomAdditionalInfo,
        RoutineExerciseID,
        RoutinesID,
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

  const deleteRoutineExerciseRecordController = async (req, res) => {
    try {
      const RoutineExerciseID = req.params.RoutineExerciseID;
      const RoutinesID = req.params.RoutinesID; 
      console.log('Delete Params: ', req.params);
  
  
      // Validate the incoming data ensuring the IDs are provided
      if (!RoutineExerciseID || !RoutinesID) {
        return res.status(400).json({ message: 'Missing required IDs' });
      }
      // Build SQL
      const sql = buildRoutineExerciseDeleteSql(RoutineExerciseID, RoutinesID);
      const result = await database.query(sql, [RoutineExerciseID, RoutinesID]);
  
      if (result[0].affectedRows === 1) {
        res.status(200).json({ message: 'Exercise record deleted successfully' });
      } else {
        res.status(400).json({ message: 'Failed to delete routine exercise record or record not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

// Endpoints ---------------------------------------------

router.get('/:RoutinesID', readAllRoutineExercisesController);
router.post('/', createRoutineExerciseController);
router.put('/:RoutineExerciseID/:RoutinesID', updateRoutineExercisesController);
router.delete('/:RoutineExerciseID/:RoutinesID', deleteRoutineExerciseRecordController);

export default router;
