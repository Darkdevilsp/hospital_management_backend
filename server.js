const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId} = require('mongodb');
const cors = require('cors');
//const bcrypt = require('bcrypt');

const app = express();
const PORT = 4000;

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
        console.log(req.body);
        const existingUser = await patients.findOne({ username: req.body.username });

        if (existingUser) {
            res.status(409).send('User already exists');
            return;
        }

        // If the user does not exist, add to the database
        const result = await patients.insertOne({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
        });
        console.log(result)
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
        const { name, age, gender,email, phoneNo, address, designation } = req.body;

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
            status:"offline"
        });

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
        const existingUser = await patients.findOne({ username: req.body.username });

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
        const existingUser = await doctors.findOne({ username: req.body.username });

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

app.get("/approvedDoctors", async (req, res) => {
    const cursor = doctorsCollection.find({ approved: "true" });
    const doctors = await cursor.toArray();
    res.send(doctors);
});

app.get("/pendingDoctors", async (req, res) => {
    const cursor = doctorsCollection.find({ approved: "false" });
    const doctors = await cursor.toArray();
    res.json(doctors);
});


app.delete("/doctors/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await doctorsCollection.deleteOne(query);
    res.json(result);
});


app.put("/approve/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = doctorsCollection.updateOne(query, { $set: { approved: "true" } });
    res.json(result);
});


app.get("/doctors/:email", async (req, res) => {
    const email = req.params.email;
    const cursor = doctorsCollection.find({ email });
    const doctor = await cursor.toArray();
    res.json(doctor);
});


app.post("/bookappointment", async (req, res) => {
    const { patient,date, doctor, timeSlot } = req.body;

    try {
        const response=await AppointmentsCollection.insertOne({
            patientName:patient,
            date:date,
            doctor:doctor,
            time:timeSlot });
        console.log(response.insertedId);
        if(response)
        {
            res.send("Added successfully")
        }
        else{
            res.send("Failed to book")
        }
    } catch (error) {
        console.error("Error booking appointment:", error);
      res.send("Failed to book")
    }
});


app.get("/appointments", async (req, res) => {
    const cursor = AppointmentsCollection.find({});
    const appointments = await cursor.toArray();
    res.json(appointments);
});


app.post("/doctors", async (req, res) => {
    // console.log('files', req.files)
    const doctor = req.body;
    // add image buffer
    const pic = req.files.image[0];
    const picData = pic.data;
    const encodedPic = picData.toString("base64");
    const imageBuffer = Buffer.from(encodedPic, "base64");
    doctor.image = imageBuffer;
    const result = await doctorsCollection.insertOne(doctor);
    res.json(result);
});


app.get('/patients/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) }
    const result = await AppointmentsCollection.findOne(query)
    res.json(result);
})


app.delete("/patients/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await AppointmentsCollection.deleteOne(query);
    res.json(result);
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
        const appointments = await  AppointmentsCollection.find({}).toArray();
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.delete("/deleteAppointment", async (req, res) => {
    const { id } = req.body;
    console.log(id);
    try {
        const result = await AppointmentsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            console.log(result);
            res.json("Treated");
        } else {
            res.status(404).json("Appointment not found");
        }
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
