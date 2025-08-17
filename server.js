const express = require('express');
const fs = require('fs');
const cors = require('cors');
const os = require('os');

const app = express();

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

let labPrices = {};
let appData = {
    patients: [], medications: [], labTests: [], appointments: [],
    payments: [], labResults: [], radiologyResults: [], patientQueue: [],
    medicationRequests: [], income: [], expenses: [], staff: [], inventory: []
};

// Users (same as your current setup)
const users = {
  'DrYusuf': { password: 'dr5849', role: 'ceo', name: 'Dr Yusuf Abdela (CEO)', canAccess: 'all' },
  'Manager': { password: 'manager5849', role: 'manager', name: 'Hospital Manager', canAccess: 'all_except_ceo' },
  'Receptionist1': { password: '1234', role: 'receptionist', name: 'Receptionist 1' },
  // ... rest of users ...
};

// Add Doctor1–Doctor50
for (let i=1; i<=50; i++) {
    users[`Doctor${i}`] = {
        password: `doctor${i}`,
        role: 'doctor',
        name: `Doctor ${i}`,
        department: ['Emergency','Internal Medicine','Pediatrics','OBS/GYNE','Surgery','ICU'][Math.floor(Math.random()*6)]
    };
}

// Load / Save functions
function loadData() {
    try {
        if(fs.existsSync('appData.json')) appData = JSON.parse(fs.readFileSync('appData.json','utf8'));
        if(fs.existsSync('labPrices.json')) labPrices = JSON.parse(fs.readFileSync('labPrices.json','utf8'));
    } catch(e) { console.error(e); }
}
function saveData() { try { fs.writeFileSync('appData.json', JSON.stringify(appData,null,2),'utf8'); } catch(e){console.error(e);} }
function saveLabPrices() { try { fs.writeFileSync('labPrices.json', JSON.stringify(labPrices,null,2),'utf8'); } catch(e){console.error(e);} }

loadData();

// Health check route
app.get('/health', (req,res) => res.json({ status:'Server is running ✅', timestamp:new Date().toISOString() }));

// Login route
app.post('/login', (req,res) => {
    const { username, password } = req.body;
    const foundUser = Object.entries(users).find(([k,v]) => k.toLowerCase() === username.toLowerCase() && v.password===password);
    if(foundUser) res.json({ message:'Success', user:foundUser[1] });
    else res.status(401).json({ message:'Invalid credentials' });
});

// Lab prices
app.post('/save-lab-price', (req,res) => {
    const { testType, price } = req.body;
    if(testType && price){ labPrices[testType.toLowerCase()]=price; saveLabPrices(); res.json({success:true}); }
    else res.status(400).json({ error:'Invalid data' });
});
app.get('/get-lab-price/:testType', (req,res)=> res.json({ price: labPrices[req.params.testType.toLowerCase()] || null }));

// Data sync
app.get('/data', (req,res)=> res.json(appData));
app.post('/sync', (req,res)=> { appData=req.body; saveData(); res.json({success:true}); });

// Listen on Render
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, ()=> console.log(`Server running on port ${PORT}`));
