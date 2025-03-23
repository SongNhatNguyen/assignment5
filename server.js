const express = require("express");
const path = require("path");
const projectData = require("./modules/project.js");
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const PORT = process.env.PORT || 8000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const studentName = "Song Nhat Nguyen";
const studentId = "169284239";

projectData
  .initialize()
  .then(() => {
    console.log("Project data initialized successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize project data:", error);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});


app.get("/solutions/projects", async function (req, res) {
  try {
    let sector = null;
    let projects = [];

    if (req.query.sector) {
      sector = req.query.sector.trim();
      projects = await projectData.getProjectsBySector(sector);

      if (projects.length === 0) {
        return res.status(404).render("404", {
          message: "Unable to find requested project.",
          studentName: studentName,
          studentId: studentId,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      projects = await projectData.getAllProjects();
    }

    res.render("projects", { projects: projects, sector: sector });
  } catch (error) {
    res.status(404).render("404", {
      message: "Unable to find requested project.",
      studentName: studentName,
      studentId: studentId,
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/solutions/projects/:id", async function (req, res) {
  try {
    let projectId = req.params.id;
    projectId = parseInt(projectId, 10);

    if (isNaN(projectId)) {
      return res.status(400).render("404", {
        message: "Unable to find requested project.",
        studentName: studentName,
        studentId: studentId,
        timestamp: new Date().toISOString(),
      });
    }

    let project = await projectData.getProjectById(projectId);

    if (!project) {
      return res.status(404).render("404", {
        message: "Unable to find requested project.",
        studentName: studentName,
        studentId: studentId,
        timestamp: new Date().toISOString(),
      });
    }

    res.render("details", { project: project });
  } catch (error) {
    res.status(404).render("404", {
      message: "Unable to find requested project.",
      studentName: studentName,
      studentId: studentId,
      timestamp: new Date().toISOString(),
    });
  }
});

app.post("/post-request", (req, res) => {
  res.json({
    studentName,
    studentId,
    timestamp: new Date().toISOString(),
  });
});

app.get("/solutions/addProject", (req, res) => {
  projectData.getAllSectors()
    .then(sectors => {
      res.render("addProject", { sectors });
    })
    .catch(err => {
      res.render("500", { message: `Problem we encounterd: ${err}` });
    });
});

app.post("/solutions/addProject", (req, res) => {
  projectData.addProject(req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch(err => {
      res.render("500", { message: `Problem we encounterd: ${err}` });
    });
});

app.get("/solutions/editProject/:id", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const [project, sectors] = await Promise.all([
      projectData.getProjectById(projectId),
      projectData.getAllSectors()
    ]);
    res.render("editProject", { project, sectors });
  } catch (err) {
    res.status(404).render("404", {
      message: err,
      studentName,
      studentId,
      timestamp: new Date().toISOString()
    });
  }
});

app.post("/solutions/editProject", (req, res) => {
  const id = req.body.id;
  projectData.editProject(id, req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: `Problem we encounterd:${err}`
      });
    });
});

app.get("/solutions/deleteProject/:id", (req, res) => {
  const id = parseInt(req.params.id);
  projectData.deleteProject(id)
    .then(() => res.redirect("/solutions/projects"))
    .catch(err => res.render("500", { message: `Problem we encounterd: ${err}` }));
});


app.use((req, res) => {
  res.status(404).render("404", {
    message: "Unable to find requested project.",
    studentName,
    studentId,
    timestamp: new Date().toISOString(),
  });
});


