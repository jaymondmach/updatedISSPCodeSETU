const express = require("express");
const passport = require("passport");
const session = require("express-session");
const authRoutes = require("./routes/authRoute");
const passportConfig = require("./config/passport");
const bodyParser = require("body-parser");
const path = require("path");
const checkAuth = require("./middleware/checkAuth");
const { v4: uuidv4 } = require("uuid"); // Import UUID for unique IDs

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

let projects = []; // Store projects in-memory

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({ secret: "secretKey", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.get("/", (req, res) => res.render("login"));

app.get("/home", checkAuth, (req, res) =>
  res.render("index", { user: req.user })
);

// View all projects
app.get("/view-projects", checkAuth, (req, res) => {
  res.render("projects/projects", { projects }); // Pass the projects array to the view
});

// Add a new project
app.get("/add-projects", checkAuth, (req, res) => {
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
app.get("/assets", checkAuth, (req, res) => {
  const projectId = req.query.projectId;
  if (!projectId) {
    return res.status(400).send("Project ID is required.");
  }
  res.render("projects/assets", { projectId });
});

// View sensors for a project
app.get("/sensors", checkAuth, (req, res) => {
  const projectId = req.query.projectId;
  if (!projectId) {
    return res.status(400).send("Project ID is required.");
  }
  res.render("projects/sensors", { projectId });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
