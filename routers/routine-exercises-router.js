import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildRoutineExercisesSelectSql = (id, variant) => {
    let sql = '';
    let table = 'RoutineExercises';
    let fields = ['RoutinesID', 'ExerciseID', '`Order`', 'CustomWeight', 'CustomReps', 'CustomSets', 'CustomDuration', 'CustomDistance', 'CustomAdditionalInfo'];

    switch (variant) {
        default:
            sql = `SELECT ${fields.join(', ')} FROM ${table}`;
            if (id) sql += ` WHERE RoutinesID=${id}`;
    }

    return sql;
};

const buildRoutineExerciseDeleteSql = (routineExerciseId, routineId) => {
    const table = 'RoutineExercises';
    let sql = `DELETE FROM ${table} WHERE RoutineExerciseID = ? AND RoutinesID = ?`;
    const values = [routineExerciseId, routineId];
    return { sql, values };
};

const buildRoutineExerciseInsertSql = () => {
    let table = 'RoutineExercises';
    let fields = ['RoutinesID', 'ExerciseID', '`Order`', 'CustomWeight', 'CustomReps', 'CustomSets', 'CustomDuration', 'CustomDistance', 'CustomAdditionalInfo'];
    let placeholders = fields.map(() => '?').join(', ');
    return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
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
    const sql = buildRoutineExercisesSelectSql(null, null);
    try {
        const [results] = await database.query(sql);
        if (results.length === 0) {
            res.status(404).json({ message: 'No routine exercises found' });
        } else {
            res.status(200).json(results);
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Endpoints ---------------------------------------------

router.get('/', readAllRoutineExercisesController);
router.post('/', createRoutineExerciseController);

export default router;
