-- Create Users table
CREATE TABLE Users (
    UserId INT PRIMARY KEY,
    Email VARCHAR(255),
    Password VARCHAR(255),
    FirstName VARCHAR(100),
    LastName VARCHAR(100)
);

-- Create Students table without DegreeId column
CREATE TABLE Students (
    RegistrationNumber INT PRIMARY KEY,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Email VARCHAR(255)
);

-- Create Courses table
CREATE TABLE Courses (
    CourseId INT PRIMARY KEY,
    CourseName VARCHAR(255),
    Credit INT
);

-- Create StudentEnrollments table
CREATE TABLE StudentEnrollments (
    RegistrationNumber INT,
    CourseId INT,
    FOREIGN KEY (RegistrationNumber) REFERENCES Students(RegistrationNumber),
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId),
    PRIMARY KEY (RegistrationNumber, CourseId)
);

-- Create Degrees table
CREATE TABLE Degrees (
    DegreeId INT PRIMARY KEY,
    DegreeName VARCHAR(255)
);
