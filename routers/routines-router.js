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
            if (id) sql += ` WHERE UserID=${id}`;
    }
    return sql;
};

const buildRoutinesSelectRoutineIdSql = (id, variant) => {
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

const buildRoutinesDeleteSql = (routineId, userId) => {
    const table = 'Routines';
    let sql = `DELETE FROM ${table} WHERE RoutineID = ? AND UserID = ?`;
    const values = [routineId, userId];
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
    console.log("params user id: ", req.params.UserID);
    const id = req.params.UserID;
    const sql = buildRoutinesSelectSql(id, null);
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


const readRoutineByNameController = async (req, res) => {
    try {
        const routineName = req.params.RoutineName;
        console.log("routine name: ", routineName);
        console.log("req: ", req.params);
        const sql = `SELECT * FROM Routines WHERE RoutineName = ?`;
        const [results] = await database.query(sql, [routineName]);
        if (results.length === 0) {
            res.status(404).json({ message: 'Routine not found' });
        } else {
            res.status(200).json(results);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const readRoutineIDRoutinesController = async (req, res) => {
    console.log("params routine id: ", req.params.RoutineID);
    console.log("params : ", req.params);

    const routineId = req.params.RoutineID;
    const userId = req.params.UserID;
    const sql = buildRoutinesSelectRoutineIdSql(routineId, userId);
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

const deleteRoutinesController = async (req, res) => {
    try {
      const RoutineID = req.params.RoutineID;
      const UserID = req.params.UserID; 
      console.log('Delete Params: ', req.params);
  
  
      // Validate the incoming data ensuring the IDs are provided
      if (!RoutineID || !UserID) {
        return res.status(400).json({ message: 'Missing required IDs' });
      }
      // Build SQL
      const sql = buildRoutinesDeleteSql(RoutineID, UserID);
      const result = await database.query(sql, [RoutineID, UserID]);
  
      if (result[0].affectedRows === 1) {
        res.status(200).json({ message: 'Routine deleted successfully' });
      } else {
        res.status(400).json({ message: 'Failed to delete routine or routine not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Endpoints ---------------------------------------------

router.get('/:UserID', readAllRoutinesController);
router.get('/RoutineName/:RoutineName', readRoutineByNameController);
router.get('/:RoutineID/:UserID', readRoutineIDRoutinesController);
router.post('/', createRoutineController);
router.put('/:RoutineID/:UserID', updateRoutinesController);
router.delete('/:RoutineID/:UserID', deleteRoutinesController);


export default router;
