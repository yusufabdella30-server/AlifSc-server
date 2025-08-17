const express = require('express');
const fs = require('fs');
const cors = require('cors');
const os = require('os');

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let labPrices = {};
let appData = {
    patients: [],
    medications: [],
    labTests: [],
    appointments: [],
    payments: [],
    labResults: [],
    radiologyResults: [],
    patientQueue: [],
    medicationRequests: [],
    income: [],
    expenses: [],
    staff: [],
    inventory: []
};

const users = {
    'DrYusuf': { password: 'dr5849', role: 'ceo', name: 'Dr Yusuf Abdela (CEO)', canAccess: 'all' },
    'Manager': { password: 'manager5849', role: 'manager', name: 'Hospital Manager', canAccess: 'all_except_ceo' },
    'Receptionist1': { password: '1234', role: 'receptionist', name: 'Receptionist 1' },
    'Receptionist2': { password: '1234', role: 'receptionist', name: 'Receptionist 2' },
    'Receptionist3': { password: '1234', role: 'receptionist', name: 'Receptionist 3' },
    'Receptionist4': { password: '1234', role: 'receptionist', name: 'Receptionist 4' },
    'Receptionist5': { password: '1234', role: 'receptionist', name: 'Receptionist 5' },
    'Nurse1': { password: 'n1234', role: 'nurse', name: 'Emergency Nurse' },
    'Nurse2': { password: 'n1234', role: 'nurse', name: 'Internal Medicine Nurse' },
    'Nurse3': { password: 'n1234', role: 'nurse', name: 'Pediatric Nurse' },
    'Nurse4': { password: 'n1234', role: 'nurse', name: 'OBS/GYNE Nurse' },
    'Nurse5': { password: 'n1234', role: 'nurse', name: 'Surgical Nurse' },
    'Nurse6': { password: 'n1234', role: 'nurse', name: 'ICU Nurse' },
    'LabTech': { password: 'lab5849', role: 'lab_tech', name: 'Lab Technician' },
    'Radiographer': { password: 'rad5849', role: 'radiographer', name: 'Radiographer' },
    'Pathologist': { password: 'patho5849', role: 'pathologist', name: 'Pathologist' },
    'Pharmacist': { password: 'pharma12', role: 'pharmacist', name: 'Pharmacist' }
};

// Add doctors (Doctor1 to Doctor50)
for (let i = 1; i <= 50; i++) {
    users[`Doctor${i}`] = {
        password: `doctor${i}`,
        role: 'doctor',
        name: `Doctor ${i}`,
        department: ['Emergency', 'Internal Medicine', 'Pediatrics', 'OBS/GYNE', 'Surgery', 'ICU'][Math.floor(Math.random() * 6)]
    };
}

function loadData() {
    try {
        if (fs.existsSync('appData.json')) {
            const data = fs.readFileSync('appData.json', 'utf8');
            appData = JSON.parse(data);
        }
        if (fs.existsSync('labPrices.json')) {
            const prices = fs.readFileSync('labPrices.json', 'utf8');
            labPrices = JSON.parse(prices);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function saveData() {
    try {
        fs.writeFileSync('appData.json', JSON.stringify(appData, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function saveLabPrices() {
    try {
        fs.writeFileSync('labPrices.json', JSON.stringify(labPrices, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving lab prices:', error);
    }
}

// Get local IP address
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
}

loadData();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const foundUser = Object.entries(users).find(([key, value]) => 
            key.toLowerCase() === username.toLowerCase() && value.password === password
        );
        
        if (foundUser) {
            res.status(200).json({ message: 'Success', user: foundUser[1] });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/save-lab-price', (req, res) => {
    try {
        const { testType, price } = req.body;
        if (testType && price) {
            labPrices[testType.toLowerCase()] = price;
            saveLabPrices();
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Invalid data' });
        }
    } catch (error) {
        console.error('Save lab price error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/get-lab-price/:testType', (req, res) => {
    try {
        const price = labPrices[req.params.testType.toLowerCase()] || null;
        res.json({ price });
    } catch (error) {
        console.error('Get lab price error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/data', (req, res) => {
    try {
        res.json(appData);
    } catch (error) {
        console.error('Get data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/sync', (req, res) => {
    try {
        appData = req.body;
        saveData();
        res.json({ success: true });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

app.listen(PORT, HOST, () => {
    const localIP = getLocalIPAddress();
    console.log('='.repeat(50));
    console.log('🏥 Alif Speciality Center Server Started');
    console.log('='.repeat(50));
    console.log(`🌍 Server running on:`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://${localIP}:${PORT}`);
    console.log('='.repeat(50));
    console.log('📋 Available endpoints:');
    console.log(`   Health Check: http://${localIP}:${PORT}/health`);
    console.log(`   Login:        http://${localIP}:${PORT}/login`);
    console.log(`   Data Sync:    http://${localIP}:${PORT}/sync`);
    console.log('='.repeat(50));
});