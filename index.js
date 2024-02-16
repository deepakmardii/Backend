const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const fs = require("fs");
const PORT = 3000;

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

try {
  ADMINS = JSON.parse(fs.readFileSync("admins.json", "utf-8"));
  USERS = JSON.parse(fs.readFileSync("users.json", "utf-8"));
  COURSES = JSON.parse(fs.readFileSync("courses.json", "utf-8"));
} catch {
  ADMINS = [];
  USERS = [];
  COURSES = [];
}

console.log(ADMINS);

const secretKey = "S3cr3t";

// const generateJwt = (user) => {
//   const payload = { username: user.username };
//   return jwt.sign(payload, secretKey, { expiresIn: "1h" });
// };

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
    const newAdmin = { username, password };
    ADMINS.push(newAdmin);
    fs.writeFileSync("admins.json", JSON.stringify(ADMINS));
    const token = jwt.sign({ username, role: "admin" }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin created successfully", token });
  }
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

app.post("/admin/courses", authenticateJwt, (req, res) => {
  const course = req.body;
  course.id = COURSES.length + 1;
  COURSES.push(course);
  fs.writeFileSync("courses.json", JSON.stringify(COURSES));
  res.json({ message: "Course created successfully", courseId: course.id });
});

app.put("/admin/courses/:courseId", authenticateJwt, (req, res) => {
  const course = COURSES.find((c) => c.id === parseInt(req.params.courseId));
  if (course) {
    Object.assign(course, req.body);
    fs.writeFileSync("courses.json", JSON.stringify(COURSES));
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
  const { username, password } = req.body;
  const user = USERS.find((u) => u.username === username);
  if (user) {
    res.status(403).json({ message: "User already exists" });
  } else {
    const newUser = { username, password };
    USERS.push(newUser);
    fs.writeFileSync("users.json", JSON.stringify(USERS));
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User created successfully", token });
  }
});

app.post("/users/login", (req, res) => {
  const { username, password } = req.headers;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

app.get("/users/courses", authenticateJwt, (req, res) => {
  res.json({ courses: COURSES });
});

app.post("/users/courses/:courseId", authenticateJwt, (req, res) => {
  const course = COURSES.find((c) => c.id === parseInt(req.params.courseId));
  if (course) {
    const user = USERS.find((u) => u.username === req.user.username);
    if (user) {
      if (!user.purchasedCourses) {
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      fs.writeFileSync("users.json", JSON.stringify(USERS));
      res.json({ message: "Course purchased successfully" });
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

app.get("/users/purchasedCourses", authenticateJwt, (req, res) => {
  const user = USERS.find((u) => u.username === req.user.username);
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
