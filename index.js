const express = require("express");
const PORT = 3000;
const app = express();

app.use(express.json());

const ADMINS = [];
const USERS = [];
const COURSES = [];

// ADMIN ROUTES
app.post("/admin/signup", (req, res) => {
  //Admin signup logic
  const admin = req.body;
  ADMINS.push(admin);
  res.json({ message: "Admin Signed Successfully" });
});

app.post("/admin/login", (req, res) => {
  //Admin login logic
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    res.json({ message: "Logged in successfully" });
  } else {
    res.json({ message: "Admin authentication failed" });
  }
});

app.post("/admin/courses", (req, res) => {
  // Create a course logic
  const course = req.body;

  course.id = Date.now(); // Using timestamp to use as course ID
  COURSES.push(course);
  res.json({ message: "Course Created Successfully", courseId: course.id });
});

app.post("/admin/courses/:courseId", (req, res) => {
  // Edit a course logic
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    res.json({ message: "Course Updated Successfully" });
  } else {
    res.sendStatus(403).json({ message: "Course not found" });
  }
});

app.get("/admin/courses", (req, res) => {
  // Show all course
  res.json({ courses: COURSES });
});

//USER ROUTES
app.post("/user/signup", (req, res) => {
  //User signup logic
  const user = req.body;
  USERS.push(user);
  res.json({ message: "User Added Successfully" });
});

app.post("/user/login", (req, res) => {
  //User login logic
  const { username, password } = req.headers;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    res.json({ message: "User logged in sucsessfuly" });
  } else {
    res.json({ message: "User doesnot exist" });
  }
});

app.get("/user/courses", (req, res) => {
  // Logic to see all courses
  res.json(COURSES);
});

app.post("/user/courses/:courseId", (req, res) => {
  // Logic to buy a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    req.user.purchasedCourses.push(courseId);
    res.json({ message: "Course purchased successfully" });
  } else {
    res.json({ message: "Course not found" });
  }
});

app.get("user/purchasedCourse", (req, res) => {
  //Logic to see all purchased courses
  var purchasedCourseIds = req.user.purchasedCourses;
  var purchasedCourses = [];
  // purchasedCoursesIds.forEach((id) => {
  //   purchasedCourses.push(COURSES.find((c) => c.id === id));
  // });    OR
  for (let i = 0; i < COURSES.length; i++) {
    if (purchasedCourseIds.indexOf(COURSES[i].id) !== -1) {
      purchasedCourses.push(COURSES[i]);
    }
  }
  res.json({ purchasedCourses });
});

app.listen(PORT, () => {
  console.log(`Listining on port ${PORT}`);
});
