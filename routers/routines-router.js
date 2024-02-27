import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

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

const buildRoutineInsertSql = () => {
    let table = 'Routines';
    let fields = ['UserID', 'RoutineName', 'RoutineDescription'];
    let placeholders = fields.map(() => '?').join(', ');
    return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
};

const buildRoutineUpdateSql = (RoutineName, RoutineDescription, RoutineID, UserID) => {
    let table = 'Routines';
    let fieldsToUpdate = [
        'RoutineName = ?',
        'RoutineDescription = ?',
    ];
    let conditions = 'RoutineID = ? AND UserID = ?';

    let sql = `UPDATE ${table} SET ${fieldsToUpdate.join(', ')} WHERE ${conditions}`;
    let values = [RoutineName, RoutineDescription, RoutineID, UserID];
    return { sql, values };
};

// Controllers -------------------------------------------

const createRoutineController = async (req, res) => {
    try {
        const UserID = 1;
        const { 
            RoutineName, 
            RoutineDescription 
        } = req.body;
        console.log("routine body is : ", req.body);

        // Validate the incoming data
        if (!RoutineName || !RoutineDescription) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const sql = buildRoutineInsertSql();
        const result = await database.query(sql, [
            UserID, 
            RoutineName, 
            RoutineDescription]);

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

const readAllRoutinesController = async (req, res) => {
    console.log("params routine name: ", req.params.RoutineName);
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

const updateRoutinesController = async (req, res) => {
    try {
        const routineID = req.params.RoutineID;
        const id = req.params.UserID;
        const { 
        RoutineName, 
        RoutineDescription, 
        } = req.body;
        console.log('Routine Name: ', RoutineName, 'Routine Desc: ', RoutineDescription);
        console.log('routineID: ', routineID, 'user id: ', id);
        console.log('request body: ', req.body);

    
        // Validate required fields
        if (!RoutineName || !RoutineDescription) {
        return res.status(400).json({ message: 'Missing required fields' });
        }
    
        const sql = buildRoutineUpdateSql(RoutineName, RoutineDescription, routineID, id);
        const result = await database.query(sql, [RoutineName, RoutineDescription, routineID, id]);
    
        if (result[0].affectedRows === 1) {
        res.status(200).json({ message: 'Routines updated successfully' });
        } else {
        res.status(400).json({ message: 'Failed to update routines' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.toString() });
    }
};

// Endpoints ---------------------------------------------

router.get('/:UserID', readAllRoutinesController);
router.post('/', createRoutineController);
router.put('/:RoutineID/:UserID', updateRoutinesController)

export default router;
