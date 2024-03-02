const express = require("express");
const postgres = require("postgres");
require("dotenv").config();
var sha256 = require("js-sha256");
const app = express();

const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (_, res, next) {
  res.setHeader("Access-control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

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

//Get users
app.get("/users", async (req, res) => {
  try {
    const query = await sql`SELECT * FROM users`;
    res.send(query);
  } catch (error) {
    console.error("user not find", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get reviews
app.get("/reviews", async (req, res) => {
  try {
    const query = await sql`SELECT * FROM reviews`;
    res.send(query);
  } catch (error) {
    console.error("user not comments", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get comments by Place ID
app.get("/reviews/:placeId", async (req, res) => {
  try {
    const { placeId } = req.params;
    const query = await sql`SELECT * FROM reviews WHERE place_id = ${placeId}`;
    res.send(query);
  } catch (error) {
    console.error("Error retrieving reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Posting comment & Rate
app.post("/reviews", async (req, res) => {
  const { user_id, place_id, rating, review_comment } = req.body;
  try {
    const review = await sql`
      INSERT INTO reviews (user_id, place_id, rating, review_comment)
      VALUES (${user_id}, ${place_id}, ${rating}, ${review_comment})
    `;
    res.send(review);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Delete the review by ID
app.delete("/reviews/:id", async (req, res) => {
  try {
    const reviewID = req.params.id;
    const query = await sql`DELETE FROM reviews WHERE id = ${reviewID}`;
    res.send(query);
  } catch (error) {
    console.error("Error deleting place.");
    res.status(500).send({ error: "Internal server error" });
  }
});

//get place & search by name - country & sort by hardShip
app.get("/places", async (req, res) => {
  try {
    let name = req.query.name;
    name = name ? name.toLowerCase() : "";
    let country = req.query.country;
    country = country ? country.toLowerCase() : "";
    let query = await sql`SELECT * FROM places`;
    if (!country & !name) {
      query = await sql`SELECT * FROM places`;
      res.send(query);
    } else if (name) {
      query = await sql`${query} WHERE LOWER(name) LIKE '%' || ${name} || '%'`;
      res.send(query);
    } else if (country) {
      query =
        await sql`${query} WHERE LOWER(country) LIKE '%' || ${country} || '%'`;
      res.send(query);
    } else if (req.query.sort) {
      query = sql`SELECT * FROM places ORDER BY hardship`;
      res.send(query);
    }

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
    const query = await sql`SELECT * FROM users WHERE id = ${userId}`;
    res.send(query);
  } catch (error) {
    console.error("Error retrieving place:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/places", async (req, res) => {
  try{
    const { name, description, country, hardship } = req.body;
    const places =
      await sql`INSERT INTO places (name, description, country, hardship) VALUES (${name}, ${description}, ${country}, ${hardship})`;
    res.send(places);
  }catch{
    console.error("Error adding place:", error);
    res.status(500).json({ error: "Internal server error" });
  }

});

//Delete place
app.delete("/places/:id", async (req, res) => {
  const placesId = req.params.id;
  try {
    await sql`UPDATE reviews SET place_id = NULL WHERE place_id = ${placesId}`;
    const query = await sql`DELETE FROM places WHERE id = ${placesId}`;
    res.send(query);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error deleting place:", error);
  }
});

//Edit place
app.put("/places/:id", async (req, res) => {
  try {
    const placeId = req.params.id;
    const { hardship } = req.body;
    const query =
      await sql`UPDATE places SET hardship = ${hardship} WHERE id = ${placeId}`;
    res.send(query);
  } catch (error) {
    console.error("Error updating place:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Login - SignUp
app.post("/users", async (req, res) => {
  try {
    const { username, pasword } = req.body;
    const hashedPassword = sha256(pasword);
    const findUser =
      await sql`SELECT * FROM users WHERE username = ${username} AND pasword = ${hashedPassword};`;
    if (findUser && findUser.length > 0) {
      res.send({
        user: {
          id: findUser[0].id,
          username: findUser[0].username,
          isadmin: findUser[0].isadmin,
        },
      });
    } else if (!(username === username) && !(pasword === pasword)) {
      res.status(401).json({ message: "Wrong username and/or password" });
    } else if (username.length > 0 && pasword.length > 0) {
      const newUser =
        await sql`INSERT INTO users (username, pasword, isadmin) VALUES (${username}, ${hashedPassword}, false) RETURNING *`;
      console.log("new User", newUser);
      res.status(201).json({
        message: "User created successfully",
        user: { username: newUser[0].username, pasword: newUser[0].pasword },
      });
    }
  } catch (error) {
    console.error("Login or Signup faield :", error);
    res.status(401).json({ error: "Internal server error" });
  }
});

app.listen(port, () =>
  console.log(` My App listening at http://localhost:${port}`)
);
