import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

// Function to build SQL query for selecting cardio exercises
const buildCardioExercisesSelectSql = (id, variant) => {
    let sql = '';
    let table = 'CardioExercises';
    let fields = ['ID', 'UserID', 'ExerciseExerciseID', 'Duration', 'Distance', 'AdditionalInfo', 'Date'];
  
    switch (variant) {
        default:
            sql = `SELECT ${fields.join(', ')} FROM ${table}`;
            if (id) sql += ` WHERE UserUserID=${id}`;
    }
  
    return sql;
};

// Function to build SQL query for deleting cardio exercises
const buildCardioExerciseDeleteSql = (cardioExerciseId, userUserId) => {
    const table = 'CardioExercises';
    let sql = `DELETE FROM ${table} WHERE CardioExerciseID = ? AND UserUserID = ?`;
    const values = [cardioExerciseId, userUserId];
    return { sql, values };
};

// Function to build SQL query for inserting cardio exercises
const buildCardioExerciseInsertSql = () => {
    let table = 'CardioExercises';
    let fields = ['UserUserID', 'ExerciseExerciseID', 'Duration', 'Distance', 'Date'];
    let placeholders = fields.map(() => '?').join(', ');
    return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
};

// Data Accessors ----------------------------------------

// Controllers -------------------------------------------

// Function to create a new cardio exercise
const createCardioExerciseController = async (req, res) => {
    try {
        // Hardcoded UserID for demonstration purposes ('1' represents an actual ID from the Users table)
        const userUserId = 1;
        const {
            ExerciseExerciseID,
            Duration,
            Distance,
            Date,
        } = req.body;

        // Validate the incoming data
        if (!ExerciseExerciseID || !Duration || !Distance || !Date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate Duration and Distance data as numbers only
        if (typeof Duration !== 'number' || typeof Distance !== 'number') {
            return res.status(400).json({ message: 'Duration and Distance must be numbers' });
        }

        const sql = buildCardioExerciseInsertSql();
        const result = await database.query(sql, [
            userUserId,
            ExerciseExerciseID,
            Duration,
            Distance,
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

// Function to read all cardio exercises
const readAllCardioExercisesController = async (req, res) => {
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


// Endpoints ---------------------------------------------

router.get('/', readAllCardioExercisesController);
router.post('/', createCardioExerciseController);

export default router;
