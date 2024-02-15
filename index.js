const express = require("express");
const postgres = require("postgres");
const app = express();

// const cors = require("cors");

// const corsOptions = {
//   origin: "http://5173",
// };

// app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (_, res, next) {
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

let PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID;
PGHOST = 'ep-royal-morning-23801106.us-east-2.aws.neon.tech'
PGDATABASE = 'FinalProject'
PGUSER = 'hediyealitabar'
PGPASSWORD = '0FiAKUuqdM1E'
ENDPOINT_ID = 'ep-royal-morning-23801106'

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

app.get('/places', async (req, res) => {
  try {
    let name = req.query.name;
    name = name ? name.toLowerCase() : '';
    let country = req.query.country;
    country = country ? country.toLowerCase() : '';
    let query = sql`SELECT * FROM places`;
    if (!country & !name) {
      sql`SELECT * FROM places`.then((result) => {
        res.send(result);
      });
    }
     else if (name) {
      query = sql`${query} WHERE LOWER(name) LIKE '%' || ${name} || '%'`;
      const result = await query;
      res.send(result);
    }
    else {
      query = sql`${query} WHERE LOWER(country) LIKE '%' || ${country} || '%'`;
      const result = await query;
      res.send(result);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


app.get("/places/:id", (req, res) => {
  const placeId = req.params.id;
  sql`SELECT * FROM places WHERE id = ${placeId}`
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.error("Error retrieving place:", error);
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
      console.error("Error retrieving place:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

app.post('/users', async (req, res) => {
const {username, pasword} = req.body;
const findUser = await sql `SELECT * FROM users WHERE username = ${username} AND pasword = ${pasword};`;
console.log (findUser);
if(findUser && findUser.length > 0){
  res.send(findUser);;
}
res.send({error: true, message: 'wrong username and/or pasword'});
});

app.listen(port, () =>
  console.log(` My App listening at http://localhost:${port}`)
);
