const express = require("express");
const PORT = 3000;
const app = express();

const ADMIN = [];
const USER = [];
const COURSES = [];

// ADMIN ROUTES
app.post("/admin/signup", (req, res) => {
  //Admin signup logic
});

app.post("/admin/login", (req, res) => {
  //Admin login logic
});

app.post("/admin/courses", (req, res) => {
  // Create a course logic
});

app.post("/admin/courses/:courseId", (req, res) => {
  // Edit a course logic
});

app.get("/admin/coures", (req, res) => {
  // Show all course
});

//USER ROUTES
app.post("/user/signup", (req, res) => {
  //User signup logic
});

app.post("/user/signin", (req, res) => {
  //User login logic
});

app.get("/user/courses", (req, res) => {
  // Logic to see all courses
});

app.post("/user/courses/:courseId", (req, res) => {
  // Logic to buy a course
});

app.get("user/purchasedCourse", (req, res) => {
  //Logic to see all purchased courses
});

app.listen(PORT, () => {
  console.log(`Listining on port ${PORT}`);
});
