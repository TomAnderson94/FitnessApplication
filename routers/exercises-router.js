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
  };

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
    const id = req.params.ExerciseTypeTypeID; 
    console.log("id = ", id);
    // Build SQL 
    const table = 'Exercises';
    const whereField = 'ExerciseTypeTypeID';
    const fields = ['ExerciseID', 'ExerciseName', 'ExerciseTypeTypeID'];
    const extendedTable = `${table} LEFT JOIN ExerciseTypes ON Exercises.ExerciseTypeTypeID=ExerciseTypes.ExerciseTypeID`;
    //  const extendedFields;
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

router.get('/', exercisesController);
router.get('/:ExerciseID', exercisesController);
router.get('/exercise-types/:ExerciseTypeTypeID', exercisesOfTypeController);

export default router;
