// Imports --------------------------------------------------
import express from 'express';
import database from './database.js';
import cors from 'cors';
import exercisesRouter from './routers/exercises-router.js';

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

};

const buildUserExercisesSelectSql = (id, variant) => {
  let sql = '';
  let table = 'UserExercises';
  let fields = ['UserExerciseID', 'UserUserID', 'ExerciseExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];

  switch (variant) {
    default:
      sql = `SELECT ${fields.join(', ')} FROM ${table}`;
      if (id) sql += ` WHERE UserUserID=${id}`;
  }

  return sql;
};



/*
const buildSetFields = (fields) => fields.reduce((setSQL, field, index) =>
  setSQL + `${field}=:${field}` + ((index === fields.length - 1) ? '' : ', '), 'SET ');


  
  const buildRecordUserExerciseCreateSql = (record) => {
    let table = 'UserExercises';
    let mutableFields = ['UserUserID', 'ExerciseExerciseID', 'Weight', 'Reps', 'Sets', 'Date'];
    return `INSERT INTO ${table} ` + buildSetFields(mutableFields);
  };*/

const buildDeleteUserExerciseSql = (userExerciseId, userUserId) => {
  const table = 'UserExercises';
  let sql = `DELETE FROM ${table} WHERE UserExerciseID = ? AND UserUserID = ?`;
  const values = [userExerciseId, userUserId];
  return { sql, values };
}


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


const recordUserExerciseController = async (req, res) => {
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
  
  const sql = buildUserExercisesSelectSql(id, null);
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
    console.log('Delete Params: ', req.params);


    // Validate the incoming data ensuring the IDs are provided
    if (!UserExerciseID || !UserUserID) {
      return res.status(400).json({ message: 'Missing required IDs' });
    }
    // Build SQL
    const { sql, values } = buildDeleteUserExerciseSql(UserExerciseID, UserUserID);

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

/*
const getUserByUsername = async (username) => {
  const sql = 'SELECT UserID, FirstName, LastName, UserRole FROM Users WHERE username = ?';
  const [users] = await database.query(sql, [username]);
  return users[0];
};

const registerUserController = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const sql = 'INSERT INTO Users (Username, Password, UserRole) VALUES (?, ?, ?)';
    await database.query(sql, [username, password, role]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/


const loginController = async (req, res) => {
  try {
    const { username } = req.body;

    // Check to assign user type
    let userType;
    if (username.includes('.exerciser')) {
      userType = 'exerciser';
    } else if (username.includes('.trainer')) {
      userType = 'trainer';
    } else if (username.includes('.admin')) {
      userType = 'admin';
    } else {
      return res.status(401).json({ message: 'Login failed' });
    }

    // Respond with the user type
    res.json({ userType });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};




  

// Endpoints ------------------------------------------------

// Exercises
app.use('/api/exercises', exercisesRouter);

// Exercise Types
app.get('/api/exerciseTypes', exerciseTypesController);
app.get('/api/exerciseTypes/:ExerciseTypeID', exerciseTypesController);

// User Exercises
app.get('/api/userExercises', allUserExercisesController);
app.get('/api/userExercises/:UserUserID', userExercisesController);
app.post('/api/userExercises', recordUserExerciseController);

app.put('/api/userExercises/:UserExerciseID/:UserUserID', updateExerciseRecordController);
app.delete('/api/userExercises/:UserExerciseID/:UserUserID', deleteExerciseRecordController);

// Login
app.post('/api/login', loginController);




/*app.get('/hello', helloController);
app.get('/add/:var1,:var2', addController);*/

// Start Server ---------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));
