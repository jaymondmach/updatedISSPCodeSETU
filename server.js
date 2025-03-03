const express = require("express");
const passport = require("passport");
const session = require("express-session");
const authRoutes = require("./routes/authRoute");
const passportConfig = require("./config/passport");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); 
const { ensureAuthenticated, ensureAdmin } = require("./middleware/checkAuth");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

let projects = []; // Store projects in memory (mock database)
const users = [
    { id: 1, name: "Rishi", email: "rishi@example.com", password: "pass123", isAdmin: true, pendingApproval: false },
    { id: 2, name: "Samantha", email: "samantha@example.com", password: "pass123", isAdmin: false, pendingApproval: false },
]; // Mock database for users

const pendingUsers = [
    // { id: 3, name: "Alice", email: "alice@example.com", password: "pass456", isAdmin: false, pendingApproval: true },
    // { id: 4, name: "Bob", email: "bob@example.com", password: "pass789", isAdmin: false, pendingApproval: true },
]; // Mock database for pending users

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({ secret: "secretKey", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.get("/", (req, res) => res.render("login"));

// Home page (authenticated users only)
app.get("/home", ensureAuthenticated, (req, res) =>
    res.render("index", { user: req.user })
);

// Admin dashboard route
app.get("/admin-dashboard", ensureAuthenticated, ensureAdmin, (req, res) => {
    console.log("Rendering admin-dashboard with pendingUsers:", pendingUsers); // Log pendingUsers
    res.render("admin-dashboard", { user: req.user, pendingUsers }); // Pass pendingUsers to the view
});

// Manage users route
app.get("/manage-users", ensureAuthenticated, ensureAdmin, (req, res) => {
  const nonAdminUsers = users.filter((user) => !user.isAdmin && !user.pendingApproval);

  res.render("manage-users", {
      users: nonAdminUsers, 
      pendingUsers,
  });
});

// Approve user route
app.post("/approve-user/:id", ensureAuthenticated, ensureAdmin, (req, res) => {
  const userId = parseInt(req.params.id); 
  const userIndex = pendingUsers.findIndex((user) => user.id === userId);

  if (userIndex !== -1) {
      const approvedUser = pendingUsers.splice(userIndex, 1)[0]; // Remove from pendingUsers
      approvedUser.pendingApproval = false; // Mark as approved
      users.push(approvedUser);
      res.redirect("/manage-users");
  } else {
      res.status(404).send("User not found");
  }
});

// Reject user route
app.post("/reject-user/:id", ensureAuthenticated, ensureAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = pendingUsers.findIndex((user) => user.id === userId);

  if (userIndex !== -1) {
      pendingUsers.splice(userIndex, 1); // Remove the user from pendingUsers
      res.redirect("/manage-users");
  } else {
      res.status(404).send("User not found"); // Send 404 if user ID is invalid
  }
});

// Delete user route
app.post("/delete-user/:id", ensureAuthenticated, ensureAdmin, (req, res) => {
    const userId = parseInt(req.params.id); // Get the user ID from the URL
    const userIndex = users.findIndex((user) => user.id === userId); // Find the user by ID

    if (userIndex !== -1) {
        users.splice(userIndex, 1); // Remove the user from the array
        res.redirect("/manage-users"); // Redirect back to the manage users page
    } else {
        res.status(404).send("User not found");
    }
});

app.get("/signup", (req, res) => {
    res.render("signup");
});
// Register new user route
app.post("/signup", (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email) || pendingUsers.find((user) => user.email === email);
    if (existingUser) {
        return res.status(400).send("User with this email already exists.");
    }
    // Add new user to pendingUsers
    const newUser = {
        id: uuidv4(), // Generate a unique ID
        name,
        email,
        password,
        isAdmin: false,
        pendingApproval: true, // Mark user as pending approval
    };
    pendingUsers.push(newUser);
    res.redirect("/auth/login");
});

// View all projects
app.get("/view-projects", ensureAuthenticated, (req, res) => {
    res.render("projects/projects", { projects });
});

// Add a new project
app.get("/add-projects", ensureAuthenticated, (req, res) => {
    res.render("projects/add-projects");
});

app.post("/add-projects", (req, res) => {
    const { name, date, description } = req.body;
    const newProject = {
        id: uuidv4(),
        name,
        date,
        description,
    };
    projects.push(newProject); // Store the new project with an ID
    res.redirect("/view-projects");
});

// View assets for a project
app.get("/assets", ensureAuthenticated, (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) {
        return res.status(400).send("Project ID is required.");
    }
    res.render("projects/assets", { projectId });
});

// View sensors for a project
app.get("/sensors", ensureAuthenticated, (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) {
        return res.status(400).send("Project ID is required.");
    }
    res.render("projects/sensors", { projectId });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});