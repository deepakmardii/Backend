const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = 3000;

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secretKey = "S3cr3t";

const generateJwt = (user) => {
  const payload = { username: user.username };
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const existingAdmin = ADMINS.find((a) => a.username === admin.username);
  if (existingAdmin) {
    res.status(403).json({ message: "Admin already exists" });
  } else {
    ADMINS.push(admin);
    const token = generateJwt(admin);
    res.json({ message: "Admin created successfully", token });
  }
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );

  if (admin) {
    const token = generateJwt(admin);
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }
});

app.post("/admin/courses", authenticateJwt, (req, res) => {
  const course = req.body;
  course.id = COURSES.length + 1;
  COURSES.push(course);
  res.json({ message: "Course created successfully", courseId: course.id });
});

app.put("/admin/courses/:courseId", authenticateJwt, (req, res) => {
  const courseId = parseInt(req.params.courseId);

  const courseIndex = COURSES.findIndex((c) => c.id === courseId);

  if (courseIndex > -1) {
    const updatedCourse = { ...COURSES[courseIndex], ...req.body };
    COURSES[courseIndex] = updatedCourse;
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

app.get("/admin/courses", authenticateJwt, (req, res) => {
  res.json({ courses: COURSES });
});

//USER ROUTES
app.post("/users/signup", (req, res) => {
  // const user = {...req.body, purchasedCourses: []};
  const user = {
    username: req.body.username,
    password: req.body.password,
    purchasedCourses: [],
  };
  USERS.push(user);
  res.json({ message: "User created successfully" });
});

app.post("/users/login", userAuthentication, (req, res) => {
  res.json({ message: "Logged in successfully" });
});

app.get("/users/courses", userAuthentication, (req, res) => {
  // COURSES.filter(c => c.published)
  let filteredCourses = [];
  for (let i = 0; i < COURSES.length; i++) {
    if (COURSES[i].published) {
      filteredCourses.push(COURSES[i]);
    }
  }
  res.json({ courses: filteredCourses });
});

app.post("/users/courses/:courseId", userAuthentication, (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId && c.published);
  if (course) {
    req.user.purchasedCourses.push(courseId);
    res.json({ message: "Course purchased successfully" });
  } else {
    res.status(404).json({ message: "Course not found or not available" });
  }
});

app.get("/users/purchasedCourses", userAuthentication, (req, res) => {
  // const purchasedCourses = COURSES.filter(c => req.user.purchasedCourses.includes(c.id));
  // We need to extract the complete course object from COURSES
  // which have ids which are present in req.user.purchasedCourses
  var purchasedCourseIds = req.user.purchasedCourses;
  [1, 4];
  var purchasedCourses = [];
  for (let i = 0; i < COURSES.length; i++) {
    if (purchasedCourseIds.indexOf(COURSES[i].id) !== -1) {
      purchasedCourses.push(COURSES[i]);
    }
  }

  res.json({ purchasedCourses });
});

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
