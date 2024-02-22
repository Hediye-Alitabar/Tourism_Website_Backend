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
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Authorization");
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
    else if (country) {
      query = sql`${query} WHERE LOWER(country) LIKE '%' || ${country} || '%'`;
      const result = await query;
      res.send(result);
    }
    else if (req.query.sort) {
      query = sql`SELECT * FROM place ORDER BY price`;
      res.send(query);
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

  const query = sql`DELETE FROM places WHERE id = ${placeID}`
    .then(() => {
      res.send(query);
    })
    .catch((error) => {
      res.status(500).send("Error deleting place.");
    });
});

app.patch("/places/:id", (req, res) => {
  const placeID = req.params.id;
  let { hardship } = req.body;
  sql`UPDATE places SET hardship = ${hardship} WHERE id = ${placeID}`
    .then(() => {
      res.send(`Hardship of Place with ID ${placeID} has been updated.`);
    })
    .catch((error) => {
      res.status(500).send("Error updating Place`s name.");
    });
});

app.put("/places/:id", async (req, res) => {
  try {
    const placeId = req.params.id;
    const { hardship } = req.body;

    const query = await sql`UPDATE places SET hardship = ${hardship} WHERE id = ${placeId}`;

    res.send(query);
  } catch (error) {
    console.error("Error updating place:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post('/users', async (req, res) => {
  const { username, pasword } = req.body;
  const headers = req.headers;
  console.log(headers);
  const findUser = await sql`SELECT * FROM users WHERE username = ${username} AND pasword = ${pasword};`;
  if (findUser && findUser.length > 0) {
    res.send({ user: { id: findUser[0].id, username: findUser[0].username, isadmin: findUser[0].isadmin } });
  } else {
    res.status(401).json({ error: true, message: 'wrong username and/or password' });
  }
});


app.listen(port, () =>
  console.log(` My App listening at http://localhost:${port}`)
);
