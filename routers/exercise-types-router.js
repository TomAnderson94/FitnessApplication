import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildExerciseTypesSelectSql = (id, variant) => {
    let sql = '';
    let table = 'ExerciseTypes';
    let fields = ['ExerciseTypeID', 'ExerciseTypeName', 'ExerciseTypeURL'];

    switch (variant) {
        default:
        sql = `SELECT ${fields} FROM ${table}`;
        if (id) sql += ` WHERE ExerciseTypeID=${id}`;
    }
    return sql;
};

// Controllers -------------------------------------------

const readExerciseTypesController = async (req,res) => {
    const id = req.params.ExerciseTypeID;
    // Build SQL 
    const sql = buildExerciseTypesSelectSql(id, null);
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

router.get('/', readExerciseTypesController);
router.get('/:ExerciseTypeID', readExerciseTypesController);

export default router;
