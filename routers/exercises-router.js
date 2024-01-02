import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildExercisesSelectSql = (id) => {
    let sql = '';
    const table = 'Exercises';
    const fields = ['ExerciseID', 'ExerciseTypeTypeID', 'ExerciseName'];
    const extendedTable = `${table} LEFT JOIN ExerciseTypes ON Exercises.ExerciseTypeTypeID=ExerciseTypes.ExerciseTypeID`;
  
    sql = `SELECT ${fields.join(', ')} FROM ${extendedTable}`;
  
    if (id) {
        sql += ` WHERE Exercises.ExerciseID=${id}`;
    }
  
    return sql;
  }

// Data Accessors ----------------------------------------


// Controllers -------------------------------------------

const exercisesController = async (req,res) => {
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

const exercisesOfTypeController = async (req,res) => {
    const id = req.params.ExerciseExerciseTypeID; 
    // Build SQL 
    const table = 'Exercises';
    const whereField = 'ExerciseExerciseTypeID';
    const fields = ['ExerciseID', 'ExerciseName', 'ExerciseExerciseTypeID', 'ExerciseURL'];
    const extendedTable = `${table} LEFT JOIN ExerciseTypes ON Exercises.ExerciseExerciseTypeID=ExerciseTypes.ExerciseTypeID`;
    //  const extendedFields;
    const sql = `SELECT ${fields} FROM ${extendedTable} WHERE ${whereField}=${id}`;
    // Execute query
    let isSuccess = false;
    let message = "";
    let result = null;
    try {
        [result] = await database.query(sql);
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

router.get('/', exercisesController);
router.get('/:ExerciseID', exercisesController);
router.get('/exercise-types/:ExerciseExerciseTypeID', exercisesOfTypeController);

export default router;
