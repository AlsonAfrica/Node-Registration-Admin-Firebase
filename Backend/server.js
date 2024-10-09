const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors'); // Add CORS

const app = express();
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})); // Enable CORS for cross-origin requests
app.use(express.json()); // Use built-in middleware to parse JSON

// Initialize Firebase Admin SDK with the service account key
const serviceAccount = require('../Backend/node-registration-server-firebase-adminsdk-7yhna-e89d3eabd5.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Uncomment and set if using Realtime Database
    // databaseURL: 'https://node-registration-server.firebaseio.com' 
});

const db = admin.firestore(); // Firestore reference

// Create (POST) - Add new user
app.post('/users', async (req, res) => {
    try {
        const { name, email, phone, position, image, idNumber } = req.body; // Change here

        // Validate request body
        if (!name || !email || !phone || !position || !idNumber) { // Change here
            return res.status(400).json({ error: 'All fields are required' });
        }

        const userRef = db.collection('users').doc(); // Generate unique ID

        await userRef.set({ name, email, phone, position, image, idNumber }); // Change here
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error); // Detailed error logging
        res.status(500).json({ error: 'Error creating user', details: error.message });
    }
});

// Read (GET) - Get all users
app.get('/users', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(usersList);
    } catch (error) {
        console.error('Error fetching users:', error); // Detailed error logging
        res.status(500).json({ error: 'Error fetching users', details: error.message });
    }
});

// Read (GET) - Get user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
        console.error('Error fetching user:', error); // Detailed error logging
        res.status(500).json({ error: 'Error fetching user', details: error.message });
    }
});

// Update (PUT) - Update user data
app.put('/users/:id', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        const { name, email, phone, position, image, idNumber } = req.body; // Change here

        // Validate request body
        if (!name && !email && !phone && !position && !idNumber) {
            return res.status(400).json({ error: 'At least one field must be provided' });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone; // Change here
        if (position) updateData.position = position;
        if (image) updateData.image = image;
        if (idNumber) updateData.idNumber = idNumber;

        await userRef.update(updateData);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error); // Detailed error logging
        res.status(500).json({ error: 'Error updating user', details: error.message });
    }
});

// Delete (DELETE) - Remove a user
app.delete('/users/:id', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        const userSnapshot = await userRef.get();

        // Check if the user exists before attempting to delete
        if (!userSnapshot.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userSnapshot.data(); // Get the user data

        // Create a reference to the previousEmployees collection
        const previousEmployeesRef = db.collection('previousEmployees');
        await previousEmployeesRef.add({
            ...userData, // Add the existing user data
            deletedAt: new Date(), // Optionally add a timestamp
            deletedId: req.params.id // Store the original ID for reference
        });

        // Now delete the user from the users collection
        await userRef.delete();

        res.status(200).json({ message: 'User deleted and moved to previous employees successfully' });
    } catch (error) {
        console.error('Error deleting user:', error); // Detailed error logging
        res.status(500).json({ error: 'Error deleting user', details: error.message });
    }
});


// Super Admins End Points 
app.post('/super-admins', async (req, res) => {
    try {
        const { userName, surname, email, password, photo, age, role,idNumber } = req.body;

        // Validate required fields
        if (!userName || !surname || !email || !password || !age || !idNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const superAdminRef = db.collection('super-admins').doc(); // Generate unique ID for Super Admin

        // Create the Super Admin document
        await superAdminRef.set({
            userName,
            surname,
            email,
            password, // Ensure that password is securely handled (e.g., hashed)
            photo,
            idNumber,
            age,
            role: role || 'Super Admin', // Default role to 'Super Admin' if not provided
        });

        res.status(201).json({ message: 'Super Admin created successfully' });
    } catch (error) {
        console.error('Error creating Super Admin:', error);
        res.status(500).json({ error: 'Error creating Super Admin', details: error.message });
    }
});

// Get all Super Admins
app.get('/super-admins', async (req, res) => {
    try {
        const superAdminsSnapshot = await db.collection('super-admins').get();
        const superAdminsList = superAdminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(superAdminsList);
    } catch (error) {
        console.error('Error fetching Super Admins:', error);
        res.status(500).json({ error: 'Error fetching Super Admins', details: error.message });
    }
});

// Get Super Admin by ID
app.get('/super-admins/:id', async (req, res) => {
    try {
        const superAdminRef = db.collection('super-admins').doc(req.params.id);
        const superAdminDoc = await superAdminRef.get();
        if (!superAdminDoc.exists) {
            return res.status(404).json({ error: 'Super Admin not found' });
        }
        res.status(200).json({ id: superAdminDoc.id, ...superAdminDoc.data() });
    } catch (error) {
        console.error('Error fetching Super Admin:', error);
        res.status(500).json({ error: 'Error fetching Super Admin', details: error.message });
    }
});

// Update (PUT) - Update Super Admin data
app.put('/super-admins/:id', async (req, res) => {
    try {
        const { userName, surname, email, password, photo, age, role,idNumber } = req.body;
        const superAdminRef = db.collection('super-admins').doc(req.params.id);

        // Validate that at least one field is provided for updating
        if (!userName && !surname && !email && !password && !photo && !age && !role && !idNumber) {
            return res.status(400).json({ error: 'At least one field must be provided' });
        }

        const updateData = {};
        if (userName) updateData.userName = userName;
        if (surname) updateData.surname = surname;
        if (email) updateData.email = email;
        if (password) updateData.password = password; // Handle securely (e.g., hash)
        if (photo) updateData.photo = photo;
        if (age) updateData.age = age;
        if (role) updateData.role = role;
        if(idNumber) updateData.idNumber = idNumber;

        await superAdminRef.update(updateData);
        res.status(200).json({ message: 'Super Admin updated successfully' });
    } catch (error) {
        console.error('Error updating Super Admin:', error);
        res.status(500).json({ error: 'Error updating Super Admin', details: error.message });
    }
});

// delete super admins by id
app.delete('/super-admins/:id', async (req, res) => {
    try {
        const superAdminRef = db.collection('super-admins').doc(req.params.id);
        await superAdminRef.delete();
        res.status(200).json({ message: 'Super Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting Super Admin:', error);
        res.status(500).json({ error: 'Error deleting Super Admin', details: error.message });
    }
});



// Systems Admins endpoints 

app.post('/systems-admins', async (req, res) => {
    try {
        const { userName, surname, email, password, photo, age, role,idNumber } = req.body;

        // Validate required fields
        if (!userName || !surname || !email || !password || !age || !idNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const superAdminRef = db.collection('systems-admins').doc(); // Generate unique ID for Super Admin

        // Create the Super Admin document
        await superAdminRef.set({
            userName,
            surname,
            email,
            password, // Ensure that password is securely handled (e.g., hashed)
            photo,
            idNumber,
            age,
            role: role || 'Super Admin', // Default role to 'Super Admin' if not provided
        });

        res.status(201).json({ message: 'Super Admin created successfully' });
    } catch (error) {
        console.error('Error creating Super Admin:', error);
        res.status(500).json({ error: 'Error creating Super Admin', details: error.message });
    }
});

// Get all Systems Admins
app.get('/systems-admins', async (req, res) => {
    try {
        const systemsAdminsSnapshot = await db.collection('systems-admins').get();
        const systemsAdminsList = superAdminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(systemsAdminsList);
    } catch (error) {
        console.error('Error fetching Systems Admins:', error);
        res.status(500).json({ error: 'Error fetching Systems Admins', details: error.message });
    }
});

// Get Super Admin by ID
app.get('/systems-admins/:id', async (req, res) => {
    try {
        const systemsAdminRef = db.collection('systems-admins').doc(req.params.id);
        const systemsAdminDoc = await systemsAdminRef.get();
        if (!systemsAdminDoc.exists) {
            return res.status(404).json({ error: 'Systems Admin not found' });
        }
        res.status(200).json({ id: systemsAdminDoc.id, ...systemsAdminDoc.data() });
    } catch (error) {
        console.error('Error fetching Systems Admin:', error);
        res.status(500).json({ error: 'Error fetching Systems Admin', details: error.message });
    }
});

// Update (PUT) - Update Super Admin data
app.put('/systems-admins/:id', async (req, res) => {
    try {
        const { userName, surname, email, password, photo, age, role,idNumber } = req.body;
        const systemsAdminRef = db.collection('systems-admins').doc(req.params.id);

        // Validate that at least one field is provided for updating
        if (!userName && !surname && !email && !password && !photo && !age && !role && !idNumber) {
            return res.status(400).json({ error: 'At least one field must be provided' });
        }

        const updateData = {};
        if (userName) updateData.userName = userName;
        if (surname) updateData.surname = surname;
        if (email) updateData.email = email;
        if (password) updateData.password = password; // Handle securely (e.g., hash)
        if (photo) updateData.photo = photo;
        if (age) updateData.age = age;
        if (role) updateData.role = role;
        if(idNumber) updateData.idNumber = idNumber;

        await systemsAdminRef.update(updateData);
        res.status(200).json({ message: 'Systems Admin updated successfully' });
    } catch (error) {
        console.error('Error updating Systems Admin:', error);
        res.status(500).json({ error: 'Error updating Systems Admin', details: error.message });
    }
});

// delete super admins by id
app.delete('/systems-admins/:id', async (req, res) => {
    try {
        const systemsAdminRef = db.collection('systems-admins').doc(req.params.id);
        await systemsAdminRef.delete();
        res.status(200).json({ message: 'Systems Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting Super Admin:', error);
        res.status(500).json({ error: 'Error deleting Systems Admin', details: error.message });
    }
});


// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
