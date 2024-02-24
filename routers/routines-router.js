import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

// Function to build SQL query for selecting routines
const buildRoutinesSelectSql = (id, variant) => {
    let sql = '';
    let table = 'Routines';
    let fields = ['RoutineID', 'UserID', 'RoutineName', 'RoutineDescription'];

    switch (variant) {
        default:
            sql = `SELECT ${fields.join(', ')} FROM ${table}`;
            if (id) sql += ` WHERE RoutineID=${id}`;
    }

    return sql;
};

// Function to build SQL query for inserting routines
const buildRoutineInsertSql = () => {
    let table = 'Routines';
    let fields = ['UserID', 'RoutineName', 'RoutineDescription'];
    let placeholders = fields.map(() => '?').join(', ');
    return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
};

// Data Accessors ----------------------------------------

// Controllers -------------------------------------------

// Function to create a new routine
const createRoutineController = async (req, res) => {
    try {
        const { UserID, RoutineName, RoutineDescription } = req.body;

        // Validate the incoming data
        if (!UserID || !RoutineName || !RoutineDescription) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Perform additional validation if needed

        const sql = buildRoutineInsertSql();
        const result = await database.query(sql, [UserID, RoutineName, RoutineDescription]);

        if (result[0].affectedRows === 1) {
            res.status(201).json({ message: 'Routine created successfully' });
        } else {
            res.status(400).json({ message: 'Failed to create routine' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.toString() });
    }
};

// Function to read all routines
const readAllRoutinesController = async (req, res) => {
    const sql = buildRoutinesSelectSql(null, null);
    try {
        const [results] = await database.query(sql);
        if (results.length === 0) {
            res.status(404).json({ message: 'No routines found' });
        } else {
            res.status(200).json(results);
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Endpoints ---------------------------------------------

router.get('/', readAllRoutinesController);
router.post('/', createRoutineController);

export default router;
