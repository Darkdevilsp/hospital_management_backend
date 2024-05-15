const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId} = require('mongodb');
const cors = require('cors');
//const bcrypt = require('bcrypt');

const app = express();
const PORT = 4000;

app.use(express.static('public'));

app.use(bodyParser.json());

const corsOptions = {
    origin: '*',
};

app.use(cors(corsOptions));

let patients;
let doctors;
let management;
let AppointmentsCollection;
let doctorsCollection;

async function connect() {
    try {
        const client = await MongoClient.connect(
            "mongodb+srv://mchs109872001:Cherry@cluster0.bp4gady.mongodb.net/?retryWrites=true&w=majority",
        );
        const myDB = client.db("HMS");
        patients = myDB.collection("patients");
        doctors = myDB.collection("doctors");
        management = myDB.collection("management");
        AppointmentsCollection = myDB.collection("Appointments");
        doctorsCollection = myDB.collection("doctors");

        console.log("Connected to the database");
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
}

connect().then()


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post('/patientSignup', async (req, res) => {
    try {
        const { name, email, phoneNo, address, bloodGroup,password, } = req.body;

        console.log(req.body)
        const existingUser = await patients.findOne({ email:email });

        if (existingUser) {
            // User with the same username already exists
            res.status(409).send('User already exists');
            return;
        }

        const result = await patients.insertOne({
            name:name,
            email:email,
            phoneNo:phoneNo,
            address:address,
            bloodGroup:bloodGroup,
            password:password
        });

        if (result.acknowledged) {
            res.send('Added successfully');
        } else {
            res.status(500).send('Failed to add user');
        }
    } catch (error) {
        console.error('Error in /patientSignup route:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/doctorSignup', async (req, res) => {
    try {
        const { name, age, gender,email, phoneNo, address, designation,password } = req.body;

        const existingDoctor = await doctors.findOne({ email });

        if (existingDoctor) {
            return res.status(409).send('Doctor already exists');
        }
        const result = await doctors.insertOne({
            name:name,
            age:age,
            gender:gender,
            email:email,
            phoneNo:phoneNo,
            address:address,
            designation:designation,
            password:password
        });
        console.log(result)
        if (result.acknowledged) {
            res.send('Added successfully');

        } else {
            res.status(500).send('Failed to add doctor');
        }
    } catch (error) {
        console.error('Error in /doctorSignup route:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/managementSignup', async (req, res) => {
    try {
        const alreadyUser = await management.findOne({ username: req.body.username });

        if (alreadyUser) {
            res.status(409).send('User already exists');
            return;
        }
        const result = await management.insertOne({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
        });
        if (result.acknowledged) {
            res.send('Added successfully');
        } else {
            res.status(500).send('Failed to add user');
        }
    } catch (error) {
        console.error('Error in /managementSignup route:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/patientLogin', async (req, res) => {
    try {
        const existingUser = await patients.findOne({ email: req.body.email });

        if (existingUser) {

            if (existingUser.password === req.body.password) {

                res.status(200).send('you are ready to login');
            } else {

                res.status(401).send('Incorrect password');
            }
        } else {
            res.status(404).send("User doesn't exist");
        }
    } catch (e) {
        console.error('Login failed:', e);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/doctorLogin', async (req, res) => {
    try {
        const existingUser = await doctors.findOne({ email: req.body.email });

        if (existingUser) {

            if (existingUser.password === req.body.password) {
                res.status(200).send('you are ready to login');
            } else {
                res.status(401).send('Incorrect password');
            }
        } else {
            res.status(404).send("User doesn't exist");
        }
    } catch (e) {
        console.error('Login failed:', e);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/managementLogin', async (req, res) => {
    try {
        const existingUser = await management.findOne({ username: req.body.username });

        if (existingUser) {
            // Assuming plain text passwords (not recommended, use bcrypt for hashing)
            if (existingUser.password === req.body.password) {
                // Passwords match, allow login
                res.status(200).send('you are ready to login');
            } else {
                // Incorrect password
                res.status(401).send('Incorrect password');
            }
        } else {
            // User doesn't exist
            res.status(404).send("User doesn't exist");
        }
    } catch (e) {
        console.error('Login failed:', e);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/getdoctors", async (req, res) => {
    try {
        const doctors = await doctorsCollection.find({}).toArray();
        res.json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/bookappointment", async (req, res) => {
    const { patient, date, doctor, timeSlot } = req.body;
    console.log(req.body)
    try {
        const response = await AppointmentsCollection.insertOne({
            patientEmail: patient, // Changed from patientName to patientEmail
            date: date,
            doctor: doctor, // This should already be the doctor's email
            time: timeSlot
        });

        console.log(response.insertedId);
        if (response.insertedId) {
            res.send("Added successfully");
        } else {
            res.send("Failed to book");
        }
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.send("Failed to book");
    }
});

app.post('/patientDashboard', async (req, res) => {
    try {
        const existingUser = await patients.findOne({ username: req.body.username });
        console.log(existingUser);
        res.send(existingUser);
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/allAppointments", async (req, res) => {
    try {
        const appointments = await AppointmentsCollection.find({}).toArray();
        res.send(appointments)
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});


app.delete("/deleteAppointment/:id", async (req, res) => {
    const { id } = req.params; // Get appointment ID from URL parameter
    try {
        const result = await AppointmentsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            console.log(result);
            res.json("Deleted"); // Respond with "Deleted" upon successful deletion
        } else {
            res.status(404).json("Appointment not found");
        }
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get("/patientdetails", async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).send("Email parameter is missing");
        }

        const existingUser = await patients.findOne({ email: email });
        if (existingUser) {
            return res.send(existingUser);
        } else {
            return res.status(404).send("No user found");
        }
    } catch (e) {
        console.error("Error fetching details:", e);
        return res.status(500).send("Internal server error");
    }
});

app.put('/updatePatientDetails/:id', async (req, res) => {
    try {
        const patientId = req.params.id;
        const updatedDetails = req.body;
        const result = await patients.updateOne(
            { _id:new ObjectId( patientId )},
            { $set: {name: updatedDetails.name,
                phoneNo:updatedDetails.phoneNo,
                address:updatedDetails.address,
                bloodGroup:updatedDetails.bloodGroup,
                password:updatedDetails.password} }
        );

        if (result.modifiedCount === 1) {
            res.json(updatedDetails);
        } else {
            res.status(404).send('Patient not found');
        }
    } catch (error) {
        console.error('Error updating patient details:', error);
        res.status(500).send('Internal server error');
    }
});


app.get("/doctordetails", async (req, res) => {
    try {
        const email = req.query.email;
        console.log(email)
        if (!email) {
            return res.status(400).send("Email parameter is missing");
        }

        const existingUser = await doctors.findOne({ email: email });
        if (existingUser) {
            return res.send(existingUser);
        } else {
            return res.status(404).send("No user found");
        }
    } catch (e) {
        console.error("Error fetching details:", e);
        return res.status(500).send("Internal server error");
    }
});

app.delete("/deletedoctors/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await doctors.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            console.log(result);

            res.send("Deleted"); // Respond with "Deleted" upon successful deletion
        } else {
            res.status(404).json("doctor not found");
        }
    } catch (error) {
        console.error("Error deleting doctor:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/allpatients",async (req,res)=>{
    try{
        console.log("started")
        const allpatients=await patients.find({}).toArray()
        console.log(allpatients)
        if (allpatients)
        {
            res.json(allpatients)
        }
    }
    catch (e) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
})

app.delete("/deletepatient/:id", async (req,res)=>{
    try{
        const {id} =req.params
        const response =await patients.deleteOne({_id:new ObjectId(id)})
        if (response.acknowledged)
        {
            res.send(response.acknowledged)
        }
    }
    catch (e) {
        res.send(false)
        console.log(e)
    }
} )