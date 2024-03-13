import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildExercisesSelectSql = (id) => {
    let sql = '';
    const table = 'Exercises';
    const fields = ['ExerciseID', 'Exercises.ExerciseTypeID', 'ExerciseName'];
    const extendedTable = `${table} LEFT JOIN ExerciseTypes ON Exercises.ExerciseTypeID=ExerciseTypes.ExerciseTypeID`;
  
    sql = `SELECT ${fields.join(', ')} FROM ${extendedTable}`;
  
    if (id) {
        sql += ` WHERE Exercises.ExerciseID=${id}`;
    }
    return sql;
};

// Controllers -------------------------------------------

const readExercisesController = async (req,res) => {
    const id = req.params.ExerciseID; // Undefined in the case of /api/exercises endpoint
    // Build SQL 
    const sql = buildExercisesSelectSql(id);
    // Execute query
    let isSuccess = false;
    let message = "";
    let result = null;
    try {
        [result] = await database.query(sql);
        if (result.length === 0) message = 'No record(s) found';
        else {
            isSuccess = true;
            message = 'Record(s) successfully found';
        }
    }
    catch (error) {
        message = `Failed to execute query: ${error.message}`;
    }
    
    // Responses
    isSuccess
    ? res.status(200).json(result)
    : res.status(400).json({ message });
};

const readExercisesOfTypeController = async (req,res) => {
    const id = req.params.ExerciseTypeID; 
    console.log("id = ", id);
    // Build SQL 
    const table = 'Exercises';
    const whereField = 'ExerciseTypeID';
    const fields = ['ExerciseID', 'ExerciseName', 'ExerciseTypeID'];
    const extendedTable = `${table} LEFT JOIN ExerciseTypes ON Exercises.ExerciseTypeID=ExerciseTypes.ExerciseTypeID`;
    const sql = `SELECT ${fields.join(', ')} FROM ${extendedTable} WHERE ${whereField}=?`;
    // Execute query
    let isSuccess = false;
    let message = "";
    let result = null;
    try {
        [result] = await database.query(sql,[id]);
        if(result.length === 0) message = 'No record(s) found';
        else {
            isSuccess = true;
            message = 'Record(s) successfully found';
        }
    }
    catch (error) {
        message = `Failed to execute query: ${error.message}`;
    }
    // Responses
    isSuccess
    ? res.status(200).json(result)
    : res.status(400).json({ message });
};

// Endpoints ---------------------------------------------

router.get('/', readExercisesController);
router.get('/:ExerciseID', readExercisesController);
router.get('/exercise-types/:ExerciseTypeID', readExercisesOfTypeController);

export default router;
