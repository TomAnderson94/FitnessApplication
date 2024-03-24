import { Router } from 'express';
import database from '../database.js';

const router = Router();

// Query Builders ----------------------------------------

const buildProfilesInsertSql = () => {
    let table = 'Profiles';
    let fields = ['UserID', 'ProfileName', 'ProfileGoals', 'ProfileInterests', 'ProfileURL'];
    let placeholders = fields.map(() => '?').join(', ');
    return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
};

const buildProfilesSelectSql = (id, variant) => {
    let sql = '';
    let table = 'Profiles';
    let fields = ['ProfileID', 'UserID', 'ProfileName', 'ProfileGoals', 'ProfileInterests', 'ProfileURL'];

    switch (variant) {
        default:
        sql = `SELECT ${fields} FROM ${table}`;
        if (id) sql += ` WHERE ProfileID=${id}`;
    }
    return sql;
};

const buildAllProfilesSelectSql = (id, variant) => {
    let sql = '';
    let table = 'Profiles';
    let fields = ['ProfileID', 'UserID', 'ProfileName', 'ProfileGoals', 'ProfileInterests', 'ProfileURL'];

    switch (variant) {
        default:
            sql = `SELECT ${fields.join(', ')} FROM ${table}`;
            break;
    }
    return sql;
};

const buildProfileUpdateSql = (ProfileName, ProfileGoals, ProfileInterests, ProfileURL, id) => {
    let table = 'Profiles';
    let fieldsToUpdate = [
        'ProfileName = ?',
        'ProfileGoals = ?',
        'ProfileInterests = ?',
        'ProfileURL = ?'
    ];
    let sql = `UPDATE ${table} SET ${fieldsToUpdate.join(', ')} WHERE ProfileID = ?`;
    let values = [ProfileName, ProfileGoals, ProfileInterests, ProfileURL, id];
    return { sql, values };
};

const buildProfileDeleteSql = (userId) => {
    let table = 'Profiles';
    let sql = `DELETE FROM ${table} WHERE UserID = ?`;
    let values = [userId];
    return { sql, values };
};

// Controllers -------------------------------------------

const readProfileController = async (req, res) => {
    const id = req.params.ProfileID;
    const sql = buildProfilesSelectSql(id, null);
    const [result] = await database.query(sql, [id]);
    try {
        if (!result) {
        return res.status(404).json({ message: 'User profile not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.toString() });
    }
};

const readAllProfilesController = async (req, res) => {
    console.log("All profiles req.params: ", req.params)
    const sql = buildAllProfilesSelectSql(); 
    try {
        const [results] = await database.query(sql);
        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'No profiles found' });
        }
        res.status(200).json(results);
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
  
      const sql = buildProfilesInsertSql();
      const result = await database.query(sql, [UserID, ProfileName, ProfileGoals, ProfileInterests, ProfileURL]);
  
      if (result[0].affectedRows === 1) {
        res.status(201).json({ message: 'Profile created successfully' });
      } else {
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

        const sql = buildProfileUpdateSql(ProfileName, ProfileGoals, ProfileInterests, ProfileURL, id);
        const result = await database.query(sql, [ProfileName, ProfileGoals, ProfileInterests, ProfileURL, id]);

        if (result[0].affectedRows === 1) {
        res.status(200).json({ message: 'Profile updated successfully' });
        } else {
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

        const sql = buildProfileDeleteSql(UserID);
        const result = await database.query(sql, [UserID]);

        if (result[0].affectedRows === 1) {
        res.status(200).json({ message: 'Profile deleted successfully' });
        } else {
        res.status(400).json({ message: 'Failed to delete profile or profile not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.toString() });
    }
};

// Endpoints ---------------------------------------------

router.get('/', readAllProfilesController)
router.get('/:ProfileID', readProfileController);
router.post('/', createProfileController);
router.put('/:UserID', updateProfileController);
router.delete('/:UserID', deleteProfileController);


export default router;
