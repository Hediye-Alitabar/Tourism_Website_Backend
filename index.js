const express = require("express");
const postgres = require("postgres");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (_, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

let PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID;
PGHOST='ep-royal-morning-23801106.us-east-2.aws.neon.tech'
PGDATABASE='FinalProject'
PGUSER='hediyealitabar'
PGPASSWORD='0FiAKUuqdM1E'
ENDPOINT_ID='ep-royal-morning-23801106'

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

const port = 3000;

app.get("/places", (req, res) => {
    sql`SELECT * FROM places`.then((result) => {
      res.send(result);
    });
  });

  app.get("/users", (req, res) => {
    sql`SELECT * FROM users`.then((result) => {
      res.send(result);
    });
  });

  app.get("/reviews", (req, res) => {
    sql`SELECT * FROM reviews`.then((result) => {
      res.send(result);
    });
  });


  app.get("/places/:id", (req, res) => {
    const placeId = req.params.id;
    sql`SELECT * FROM places WHERE id = ${placeId}`
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.error("Error retrieving task:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  });

  app.get("/users/:id", (req, res) => {
    const userId = req.params.id;
    sql`SELECT * FROM users WHERE id = ${userId}`
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.error("Error retrieving task:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  });

app.listen(port, () =>
  console.log(` My App listening at http://localhost:${port}`)
);
