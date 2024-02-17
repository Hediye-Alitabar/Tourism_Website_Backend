const express = require("express");
const postgres = require("postgres");
const app = express();

const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (_, res, next) {
  res.setHeader('Access-control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
  res.setHeader("Access-Control-Allow-Credentials", true);
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

app.post("/places", async (req, res) => {
  const { name, description, country } = req.body;
  const places = await sql`INSERT INTO places (name, description, country) VALUES (${name}, ${description}, ${country})`
  res.send(places);
  // .then(() => {
  //   res.send("New place created.");
  // })
  // .catch((error) => {
  //   res.status(500).send("Error creating place.");
  // });
});

app.delete("/places/:id", (req, res) => {
  const placeID = req.params.id;

  sql`DELETE FROM places WHERE id = ${placeID}`
    .then(() => {
      res.send(`Place with ID ${placeID} has been deleted.`);
    })
    .catch((error) => {
      res.status(500).send("Error deleting place.");
    });
});

app.put("/places/:id", (req, res) => {
  const placeID = req.params.id;
  const { name, description, country } = req.body;

  sql`UPDATE places SET name = ${name}, description = ${description}, country = ${country} WHERE id = ${placeID}`
    .then(() => {
      res.send(`Place with ID ${placeID} has been updated.`);
    })
    .catch((error) => {
      res.status(500).send("Error updating place.");
    });
});

app.patch("/places/:id", (req, res) => {
  const placeID = req.params.id;
  let { name } = req.body;
  sql`UPDATE places SET name = ${name} WHERE id = ${placeID}`
  .then(() => {
    res.send(`Name of Place with ID ${placeID} has been updated.`);
  })
  .catch((error) => {
    res.status(500).send("Error updating Place`s name.");
  });
});

app.post('/users', async (req, res) => {
  const { username, pasword } = req.body;
  const findUser = await sql`SELECT * FROM users WHERE username = ${username} AND pasword = ${pasword};`;
  console.log(findUser);
  if (findUser && findUser.length > 0) {
    res.send(findUser);;
  }
  res.send({ error: true, message: 'wrong username and/or pasword' });
});

app.listen(port, () =>
  console.log(` My App listening at http://localhost:${port}`)
);
