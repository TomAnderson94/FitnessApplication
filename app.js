// Imports --------------------------------------------------
import express from 'express';
import database from './database.js';
import cors from 'cors';

// Configure Express App ------------------------------------
const app = new express();

// Configure Middleware -------------------------------------
app.use(cors()); // Add this line to enable CORS (Cross-Origin Resource Sharing)
app.use(express.json());


// Controllers ----------------------------------------------

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

}

const exercisesController = async (req,res) => {
    const id = req.params.ExerciseID; // Undefined in the case of /api/exercises endpoint
    // Build SQL 
    const table = 'Exercises';
    const whereField = 'ExerciseID';
    const fields = ['ExerciseID', 'ExerciseTypeTypeID','ExerciseName'];
    const extendedTable = `${table} LEFT JOIN ExerciseTypes ON Exercises.ExerciseTypeTypeID=ExerciseTypes.ExerciseTypeID`;
//  const extendedFields;
    let sql = `SELECT ${fields} FROM ${extendedTable}`;
    if (id) sql += ` WHERE ${whereField}=${id}`;
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

 const exerciseTypesController = async (req,res) => {
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

/*const helloController = (req,res) => res.send("Hi, my name is Server");
const addController = (req,res) => {
    const var1 = req.params.var1;
    const var2 = req.params.var2;
    const result = {
        operation: "addition",
        operand1: var1,
        operand2: var2,
        result: parseInt(var1) + parseInt(var2),
        message: 'Hope you have a good day'
    };
    res.json(result);
}*/

const recordExerciseController = async (req, res) => {
    try {
      // Hardcoded UserUserID for testing purposes ('1' represents an actual ID from the Users table)
      const UserUserID = 1;
      const {
        ExerciseExerciseID,
        Weight,
        Reps,
        Sets,
        Date,
      } = req.body;

    // Validate the incoming data
    if (!ExerciseExerciseID || !Weight || !Reps || !Sets || !Date) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
    // Validate weight data as a number only
    if (typeof Weight !== 'number') {
        return res.status(400).json({ message: 'Weight must be a number' });
      }
    
      const sql = `INSERT INTO UserExercises (UserUserID, ExerciseExerciseID, Weight, Reps, Sets, Date)
                   VALUES (?, ?, ?, ?, ?, ?)`;
      const result = await database.query(sql, [
        UserUserID,
        ExerciseExerciseID,
        Weight,
        Reps,
        Sets,
        Date,
      ]);
  
      if (result[0].affectedRows === 1) {
        res.status(201).json({ message: 'Exercise recorded successfully' });
      } else {
        res.status(400).json({ message: 'Failed to record exercise' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.toString() });
    }
  };


const userExercisesController = async (req, res) => {
  console.log("there:");
  console.log(req.params)
  const id = req.params.UserUserID; 
  console.log(id)
  

  const table = 'UserExercises';
  const whereField = 'UserUserID';
  const fields = ['UserExerciseID', 'UserUserID', 'ExerciseExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];
  const extendedTable = `${table} LEFT JOIN Exercises ON UserExercises.ExerciseExerciseID=Exercises.ExerciseID`;
  const sql = `SELECT ${fields} FROM ${extendedTable} WHERE ${whereField}=${id}`;
  console.log(sql);
  try {
    const [results] = await database.query(sql, [id]);
    if (results.length === 0) {
      res.status(404).json({ message: 'No record found with the given ID' });
    } else {
      res.status(200).json(results);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const allUserExercisesController = async (req, res) => {
 // const sql = 'SELECT * FROM UserExercises';
  const table = 'UserExercises';
  //const whereField = 'UserUserID';
  const fields = ['UserExerciseID', 'UserUserID', 'ExerciseExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];
 // const extendedTable = `${table} JOIN Exercises ON UserExercises.ExerciseExerciseID=Exercises.ExerciseID`;
  const sql = `SELECT ${fields} FROM ${table} `;
  console.log(sql);
  try {
    const [results] = await database.query(sql);
    if (results.length === 0) {
      res.status(404).json({ message: 'No exercises found' });
    } else {
      res.status(200).json(results);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const updateExerciseRecordController = async (req, res) => {
  try {    console.log('Body: ', req.body);
console.log('Params: ', req.params);
    const UserExerciseID = req.params.UserExerciseID;
 //   const UserUserID = req.params.UserUserID; 

    const {
      UserUserID,
      ExerciseExerciseID,
      Weight,
      Reps,
      Sets,
      Date,
    } = req.body;
    console.log(`message body:[${JSON.stringify(req.body)}]`);
    console.log(ExerciseExerciseID);
    console.log(Weight);
    console.log(Reps);
    console.log(Sets);


    // Validate the incoming data
    if (UserUserID === undefined || !ExerciseExerciseID || !Weight || !Reps || !Sets || !Date) {
      return res.status(400).json({ message: 'Missing required fields really' });
    }

    // Validate weight data as a number only
    if (typeof Weight !== 'number') {
      return res.status(400).json({ message: 'Weight must be a number' });
    }

    const sql = `UPDATE UserExercises 
                 SET ExerciseExerciseID = ?, Weight = ?, Reps = ?, Sets = ?, Date = ? 
                 WHERE UserExerciseID = ? AND UserUserID = ?`;
    const result = await database.query(sql, [
      ExerciseExerciseID,
      Weight,
      Reps,
      Sets,
      Date,
      UserExerciseID,
      UserUserID,
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


const deleteExerciseRecordController = async (req, res) => {
  try {
    const UserExerciseID = req.params.UserExerciseID;
    const UserUserID = req.params.UserUserID; 

    // Validate the incoming data ensuring the IDs are provided
    if (!UserExerciseID || !UserUserID) {
      return res.status(400).json({ message: 'Missing required IDs' });
    }

    const sql = `DELETE FROM UserExercises WHERE UserExerciseID = ? AND UserUserID = ?`;
    const result = await database.query(sql, [UserExerciseID, UserUserID]);

    if (result[0].affectedRows === 1) {
      res.status(200).json({ message: 'Exercise record deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete exercise record or record not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


  

// Endpoints ------------------------------------------------
app.get('/api/exercises', exercisesController);
app.get('/api/exercises/:ExerciseID', exercisesController);
app.get('/api/exercises/exercise-types/:ExerciseExerciseTypeID', exercisesOfTypeController);

app.get('/api/exerciseTypes', exerciseTypesController);
app.get('/api/exerciseTypes/:ExerciseTypeID', exerciseTypesController);

app.get('/api/userExercises', allUserExercisesController);
app.get('/api/userExercises/:UserUserID', userExercisesController);
app.post('/api/userExercises', recordExerciseController);

app.put('/api/userExercises/:UserExerciseID/:UserUserID', updateExerciseRecordController);
app.delete('/api/userExercises/:UserExerciseID/:UserUserID', deleteExerciseRecordController);




/*app.get('/hello', helloController);
app.get('/add/:var1,:var2', addController);*/

// Start Server ---------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));
