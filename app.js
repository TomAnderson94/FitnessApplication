// Imports --------------------------------------------------
import express from 'express';
import cors from 'cors';
import exercisesRouter from './routers/exercises-router.js';
import exerciseTypesRouter from './routers/exercise-types-router.js';
import userExercisesRouter from './routers/user-exercises-router.js';
import database from './database.js';
import cardioExercisesRouter from './routers/cardio-exercises-router.js';

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

const readProfileController = async (req, res) => {
 
    const id = req.params.UserID;

    // Query the database to retrieve the user's profile details
    const sql = `SELECT * FROM Profiles WHERE UserID = ?`;
    const [result] = await database.query(sql, [id]);
 try {
    if (!result) {
      // If no profile is found for the given user ID, return a 404 response
      return res.status(404).json({ message: 'User profile not found' });
    }

    // If a profile is found, return it as a JSON response
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.toString() });
  }
};

const createProfileController = async (req, res) => {
  try {
    const { 
      UserID, 
      ProfileName, 
      ProfileGoals, 
      ProfileInterests, 
      ProfileURL 
    } = req.body;

    // Validate required fields
    if (!UserID || !ProfileName || !ProfileGoals || !ProfileInterests || !ProfileURL) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert a new profile into the database
    const sql = `INSERT INTO Profiles (UserID, ProfileName, ProfileGoals, ProfileInterests, ProfileURL)
                 VALUES (?, ?, ?, ?, ?)`;
    const result = await database.query(sql, [UserID, ProfileName, ProfileGoals, ProfileInterests, ProfileURL]);

    if (result[0].affectedRows === 1) {
      // If the profile is successfully created, respond with a 201 status code
      res.status(201).json({ message: 'Profile created successfully' });
    } else {
      // If creation fails for any reason, respond with a 400 status code
      res.status(400).json({ message: 'Failed to create profile' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.toString() });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const id = req.params.UserID;
    const { 
      ProfileName, 
      ProfileGoals, 
      ProfileInterests, 
      ProfileURL 
    } = req.body;

    // Validate required fields
    if (!ProfileName || !ProfileGoals || !ProfileInterests || !ProfileURL) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Update the user's profile in the database
    const sql = `UPDATE Profiles
                 SET ProfileName = ?, ProfileGoals = ?, ProfileInterests = ?, ProfileURL = ?
                 WHERE UserID = ?`;
    const result = await database.query(sql, [ProfileName, ProfileGoals, ProfileInterests, ProfileURL, id]);

    if (result[0].affectedRows === 1) {
      // If the profile is successfully updated, respond with a 200 status code
      res.status(200).json({ message: 'Profile updated successfully' });
    } else {
      // If update fails for any reason, respond with a 400 status code
      res.status(400).json({ message: 'Failed to update profile' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.toString() });
  }
};

const deleteProfileController = async (req, res) => {
  try {
    const UserID = req.params.UserID;

    // Delete the user's profile from the database
    const sql = `DELETE FROM Profiles WHERE UserID = ?`;
    const result = await database.query(sql, [UserID]);

    if (result[0].affectedRows === 1) {
      // If the profile is successfully deleted, respond with a 200 status code
      res.status(200).json({ message: 'Profile deleted successfully' });
    } else {
      // If deletion fails or no profile is found, respond with a 400 status code
      res.status(400).json({ message: 'Failed to delete profile or profile not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.toString() });
  }
};







// Endpoints ------------------------------------------------

// Exercises
app.use('/api/exercises', exercisesRouter);

// Exercise Types
app.use('/api/exerciseTypes', exerciseTypesRouter);

// User Exercises
app.use('/api/userExercises', userExercisesRouter);

// Login
app.post('/api/login', loginController);

// Profile
app.get('/api/profiles/:UserID', readProfileController);
app.post('/api/profiles', createProfileController);
app.put('/api/profiles/:UserID', updateProfileController);
app.delete('/api/profiles/:UserID', deleteProfileController);

// Cardio Exercises
app.use('/api/cardioexercises', cardioExercisesRouter)




// Start Server ---------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));
