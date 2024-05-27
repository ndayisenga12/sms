require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Model } = require('objection');
const db = require('./knexConfig');
const authenticateToken = require('./middleware/authMiddleware');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.SERVER_PORT || 2000;

app.use(bodyParser.json());

class User extends Model {
    static get tableName() {
        return 'Users';
    }
    static get idColumn() {
        return 'NewUserId';
    }
}

class Student extends Model {
    static get tableName() {
        return 'Students';
    }
    static get idColumn() {
        return 'RegistrationNumber';
    }
}

class Course extends Model {
    static get tableName() {
        return 'Courses';
    }
    static get idColumn() {
        return 'CourseId';
    }
}

class StudentEnrollment extends Model {
    static get tableName() {
        return 'StudentEnrollments';
    }
    static get idColumn() {
        return 'CourseId';
    }
}

class Degree extends Model {
    static get tableName() {
        return 'Degrees';
    }
    static get idColumn() {
        return 'DegreeId';
    }
}

Model.knex(db);

// Authentication route - Login

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
        const user = await db('Users').where('Email', email).first();

        if (!user || !(await bcrypt.compare(password, user.Password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const accessToken = jwt.sign({ email: user.Email }, process.env.ACCESS_TOKEN_SECRET);
        res.json({ accessToken });
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Registration route - Signup

app.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.query().insert({ Email: email, Password: hashedPassword, FirstName: firstName, LastName: lastName });
        res.status(201).send('User registered successfully!');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});


// GET & POST Routes for Users

app.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.query();
        res.json(users);
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/users', async (req, res) => {
    const { UserId, Email, Password, FirstName, LastName } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        await User.query().insert({ UserId, Email, Password: hashedPassword, FirstName, LastName });
        res.status(201).send('User created successfully!!');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error!');
    }
});

// GET & POST for Students
app.get('/students', authenticateToken, async (req, res) => {
    try {
        const students = await Student.query();
        res.json(students);
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/students', authenticateToken, async (req, res) => {
    const { RegistrationNumber, FirstName, LastName, Email } = req.body;
    try {
        await Student.query().insert({ RegistrationNumber, FirstName, LastName, Email });
        res.status(201).send('Student created successfully!!');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// GET & POST for Courses
app.get('/courses', authenticateToken, async (req, res) => {
    try {
        const courses = await Course.query();
        // Convert PascalCase to lowercase
        const formattedCourses = courses.map(course => {
            return {
                courseId: course.CourseId,
                courseName: course.CourseName,
                credit: course.Credit
            };
        });
        res.json(formattedCourses);
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/courses', authenticateToken, async (req, res) => {
    const { courseId, courseName, credit } = req.body; 
    try {
        
        await Course.query().insert({ CourseId: courseId, CourseName: courseName, Credit: credit });
        res.status(201).send('Course created successfully!!');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});


// GET & POST for StudentEnrollments
app.get('/enrollments', authenticateToken, async (req, res) => {
    try {
        const enrollments = await StudentEnrollment.query();
        res.json(enrollments);
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/enrollments', authenticateToken, async (req, res) => {
    const { registrationNumber, courseId } = req.body;
    try {
        await StudentEnrollment.query().insert({ registrationNumber, courseId });
        res.status(201).send('Enrollment created successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});


// GET & POST for Degrees
app.get('/degrees', authenticateToken, async (req, res) => {
    try {
        const degrees = await Degree.query();
        res.json(degrees);
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/degrees', authenticateToken, async (req, res) => {
    const { DegreeId, DegreeName } = req.body;
    try {
        await Degree.query().insert({ DegreeId, DegreeName });
        res.status(201).send('Degree created successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// PUT route for updating a user by UserId
app.put('/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { Email, Password, FirstName, LastName } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        await db('Users').where('UserId', id).update({ Email, Password: hashedPassword, FirstName, LastName });
        res.status(200).send('User updated successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// PUT route for updating a student by RegistrationNumber
app.put('/students/:registrationNumber', authenticateToken, async (req, res) => {
    const { registrationNumber } = req.params;
    const { FirstName, LastName, Email } = req.body;
    try {
        await db('Students').where('RegistrationNumber', registrationNumber).update({ FirstName, LastName, Email });
        res.status(200).send('Student updated successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// PUT route for updating a course by CourseId
app.put('/courses/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { CourseName, Credit } = req.body;
    try {
        await db('Courses').where('CourseId', id).update({ CourseName, Credit });
        res.status(200).send('Course updated successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// PUT route for updating a student enrollment
app.put('/enrollments/:registrationNumber/:courseId', authenticateToken, async (req, res) => {
    res.status(400).send('Cannot update enrollment details');
});

// PUT route for updating a degree by DegreeId
app.put('/degrees/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { DegreeName } = req.body;
    try {
        await db('Degrees').where('DegreeId', id).update({ DegreeName });
        res.status(200).send('Degree updated successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete route for Users
app.delete('/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await User.query().deleteById(id);
        res.status(200).send('User deleted successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete route for Students
app.delete('/students/:registrationNumber', authenticateToken, async (req, res) => {
    const { registrationNumber } = req.params;
    try {
        await Student.query().deleteById(registrationNumber);
        res.status(200).send('Student deleted successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete route for Courses
app.delete('/courses/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await Course.query().deleteById(id);
        res.status(200).send('Course deleted successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete route for Enrollments
app.delete('/enrollments/:registrationNumber/:courseId', authenticateToken, async (req, res) => {
    const { registrationNumber, courseId } = req.params;
    try {
        await StudentEnrollment.query().delete().where({ RegistrationNumber: registrationNumber, CourseId: courseId });
        res.status(200).send('Enrollment deleted successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete route for Degrees
app.delete('/degrees/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await Degree.query().deleteById(id);
        res.status(200).send('Degree deleted successfully');
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
