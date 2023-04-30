require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require("./routes/users-routes");
const blogsRoutes = require("./routes/blogs-routes");

const app = express();

app.use(bodyParser.json());

mongoose.connect(process.env.DATABASE_KEY, {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/blogs", blogsRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

const hostname = "0.0.0.0";
const port = 5000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://$(hostname):$(port)/`);
});

// app.listen(5000, () => {
//   console.log("server is live");
// });
