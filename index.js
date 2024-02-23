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

//get user
app.get("/users", async (req, res) => {
  try {
    const query = sql`SELECT * FROM users`;
    res.send(query);

  } catch (error) {
    console.error("user not find", error);
    res.status(500).json({ error: "Internal server error" });


  }
  // sql`SELECT * FROM users`.then((result) => {
  //   res.send(result);
  // });
});

//get reviews
app.get("/reviews", async (req, res) => {
  try {
    const query = await sql`SELECT * FROM reviews`
    res.send(query);
  } catch (error) {
    console.error("user not comments", error);
    res.status(500).json({ error: "Internal server error" });

  }
  //  const query = await sql`SELECT * FROM reviews`
  //     res.send(query);

});

//get place & search by name - country & sort by hardShip 
app.get('/places', async (req, res) => {
  try {
    let name = req.query.name;
    name = name ? name.toLowerCase() : '';
    let country = req.query.country;
    country = country ? country.toLowerCase() : '';
    let query = await sql`SELECT * FROM places`;
    if (!country & !name) {
      query = await sql`SELECT * FROM places`;
      res.send(query);
      // sql`SELECT * FROM places`.then((result) => {
      //   res.send(result);
      // });
    }
    else if (name) {
      query = await sql`${query} WHERE LOWER(name) LIKE '%' || ${name} || '%'`;
      res.send(query);
    }
    else if (country) {
      query = await sql`${query} WHERE LOWER(country) LIKE '%' || ${country} || '%'`;
      res.send(query);
    }
    else if (req.query.sort) {
      query = sql`SELECT * FROM places ORDER BY hardship`;
      res.send(query);
    }
    // else if (req.query.sort) {
    //   query = await sql`SELECT * FROM places ORDER BY name ASC`;
    //   res.send(query);
    // }

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/places/:id", async (req, res) => {
  try {
    const placeId = req.params.id;
    const query = await sql`SELECT * FROM places WHERE id = ${placeId}`;
    res.send(query);
  } catch (error) {
    console.error("Error retrieving place:", error);
    res.status(500).json({ error: "Internal server error" });

  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const query = await sql`SELECT * FROM users WHERE id = ${userId}`
    res.send(query);
  } catch (error) {
    console.error("Error retrieving place:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/places", async (req, res) => {
  const { name, description, country } = req.body;
  const places = await sql`INSERT INTO places (name, description, country) VALUES (${name}, ${description}, ${country})`
  res.send(places);
});

//delete place 
app.delete("/places/:id", async (req, res) => {
  try {
    const placeID = req.params.id;
    const query = await sql`DELETE FROM places WHERE id = ${placeID}`
    res.send(query);

  } catch (error) {
    console.error("Error deleting place.");
    res.status(500).send({ error: "Internal server error" });
  }
});

//edit place
app.patch("/places/:id", async (req, res) => {
  try {
    const placeID = req.params.id;
    let { hardship } = req.body;
    const query = await sql`UPDATE places SET hardship = ${hardship} WHERE id = ${placeID}`;
    res.send(query);
  } catch (error) {
    console.error("place was not edit", error);
    res.status(401).json({ error: "Internal server error" })
  }
});

//edit place 
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

//login
app.post('/users', async (req, res) => {
  try {
    const { username, pasword } = req.body;
    const headers = req.headers;
    console.log(headers);
    const findUser = await sql`SELECT * FROM users WHERE username = ${username} AND pasword = ${pasword};`;
    if (findUser && findUser.length > 0) {
      res.send({ user: { id: findUser[0].id, username: findUser[0].username, isadmin: findUser[0].isadmin } });
    }
  } catch (error) {
    console.error("Login faield :", error);
    res.status(401).json({ error: 'wrong username and/or password' });
  }
});


app.listen(port, () =>
  console.log(` My App listening at http://localhost:${port}`)
);
