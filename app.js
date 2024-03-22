// Imports --------------------------------------------------
import express from 'express';
import cors from 'cors';
import exercisesRouter from './routers/exercises-router.js';
import exerciseTypesRouter from './routers/exercise-types-router.js';
import userExercisesRouter from './routers/user-exercises-router.js';
import profilesRouter from './routers/profiles-router.js';
import cardioExercisesRouter from './routers/cardio-exercises-router.js';
import routineExercisesRouter from './routers/routine-exercises-router.js';
import routinesRouter from './routers/routines-router.js';
import stretchingExercisesRouter from './routers/stretching-exercises-router.js'


// Configure Express App ------------------------------------
const app = new express();

// Configure Middleware -------------------------------------
app.use(cors()); // Add this line to enable CORS (Cross-Origin Resource Sharing)
app.use(express.json());

// Initialisation -------------------------------------------

const generateUniqueUserID = () => {
  // Generate a random number for the id
  const randomID = Math.floor(Math.random() * 1000000);
  return `user-${randomID}`;
};

// Controllers ----------------------------------------------

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

    // Check if username is provided
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Check to assign user type
    let userType;
    if (username.includes('.exerciser')) {
      userType = 'exerciser';
    } else if (username.includes('.trainer')) {
      userType = 'trainer';
    } else if (username.includes('.admin')) {
      userType = 'admin';
    } else {
      return res.status(401).json({ message: 'Login failed, invalid username' });
    }

    // Generate a unique User ID 
    const userID = generateUniqueUserID();
    console.log("user ID = ", userID);

    // Respond with the user type
    res.json({ userType,userID });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
  console.log(res.json({ userType,userID }));

};

// Endpoints ------------------------------------------------

// Login
app.post('/api/login', loginController);

// Exercise Types
app.use('/api/exerciseTypes', exerciseTypesRouter);

// Exercises
app.use('/api/exercises', exercisesRouter);

// User Exercises
app.use('/api/userExercises', userExercisesRouter);

// Profile
app.use('/api/profiles', profilesRouter);

// Routines
app.use('/api/routines', routinesRouter);

// Routine Exercises
app.use('/api/routineexercises', routineExercisesRouter);

// Cardio Exercises
app.use('/api/cardioexercises', cardioExercisesRouter);

// Stretching Exercises
app.use('/api/stretchingexercises', stretchingExercisesRouter);


// Start Server ---------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));
