const express = require("express");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Import UUID for generating unique IDs
const authRoutes = require("./routes/authRoute"); // Authentication routes
const { ensureAuthenticated, ensureAdmin } = require("./middleware/checkAuth");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

let projects = []; // Store projects in memory (mock database)
const users = [
    { id: 1, name: "Rishi", email: "rishi@example.com", password: "pass123", isAdmin: true },
    { id: 2, name: "Samantha", email: "samantha@example.com", password: "pass123", isAdmin: false },
]; // Mock database for users

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({ secret: "secretKey", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// Use authentication routes
app.use("/auth", authRoutes);

// Login page
app.get("/", (req, res) => res.render("login"));

// Home page (authenticated users only)
app.get("/home", ensureAuthenticated, (req, res) =>
    res.render("index", { user: req.user })
);

// Admin dashboard route
app.get("/admin-dashboard", ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render("admin-dashboard", { user: req.user });
});

app.get("/manage-users", ensureAuthenticated, ensureAdmin, (req, res) => {
  // Filter out admin users
  const nonAdminUsers = users.filter((user) => !user.isAdmin);

  // Pass only non-admin users to the view
  res.render("manage-users", { users: nonAdminUsers });
});

app.post("/delete-user/:id", ensureAuthenticated, ensureAdmin, (req, res) => {
  const userId = parseInt(req.params.id); // Get the user ID from the URL
  const userIndex = users.findIndex((user) => user.id === userId); // Find the user by ID

  if (userIndex !== -1) {
    users.splice(userIndex, 1); // Remove the user from the array
    res.redirect("/manage-users"); // Redirect back to the manage users page
  } else {
    res.status(404).send("User not found"); // Handle case where user ID doesn't exist
  }
});

// View all projects
app.get("/view-projects", ensureAuthenticated, (req, res) => {
    res.render("projects/projects", { projects }); // Pass the projects array to the view
});

// Add a new project
app.get("/add-projects", ensureAuthenticated, (req, res) => {
    res.render("projects/add-projects");
});

app.post("/add-projects", (req, res) => {
    const { name, date, description } = req.body;
    const newProject = {
        id: uuidv4(), // Generate a unique ID
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


// Start the server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});