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

// search => name of places
// app.get("/places/:name", (req, res) => {
//   const placeName = req.params.name.toLowerCase();
//   sql`SELECT * FROM places WHERE LOWER(name) LIKE '%' || ${placeName} || '%'`.then((result) => {
//     res.send(result);
//   })
//     .catch((error) => {
//       console.error("Error retrieving place:", error);
//       res.status(500).json({ error: "Internal server error" });
//     });
// });

// app.get("/places", (req, res) => {
//   const name = req.params.name;
//   sql`SELECT * FROM places`
//   let filters = [];
//   if(name){
//     filters.push (`name LIKE '%${name}%'`)
//   }
//    WHERE LOWER(name) LIKE '%' || ${placeName} || '%'`.then((result) => {
//     console.log('sql => ', sql);
//     const { rows: books } = await db.query(sql);

//     response.send(books);
// });


// app.get('/books', (req, res) => {
//   const name = req.query.name;

//   sql `SELECT * FROM places`.then((result) => {
//   let filters = [];

//   if (name) {
//     filters.push(` title LIKE '%${name}%' `)
//   }

//   res.send(result);
// })
// .catch((error) => {
//   console.error("Error retrieving place:", error);
//   res.status(500).json({ error: "Internal server error" });
// });
// });

// app.get('/places', (req, res) => {
//   const name = request.query.name;
//   let resultBooks = books;

//   if (name) {
//     resultBooks = books.filter(prod => prod.name.includes(name));
//   }
//   res.send(resultBooks);
// })

// app.get('/places', (req, res) => {
//   const name = req.query.name;

//   if (!name) {
//     sql`SELECT * FROM places`.then((result) => {
//       res.send(result);
//     })
//     .catch((error) => {
//       console.error("Error retrieving places:", error);
//       res.status(500).json({ error: "Internal server error" });
//     });
//   } else {
//     sql`SELECT * FROM places WHERE name LIKE '%' || ${name} || '%'`.then((result) => {
//       res.send(result);
//     })
//     .catch((error) => {
//       console.error("Error retrieving places by name:", error);
//       res.status(500).json({ error: "Internal server error" });
//     });
//   }
// });

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
const findUser = await sql `SELECT * FROM users WHERE username = ${username} AND pasword = ${pasword}:`;
console.log (findUser);
if(findUser && findUser.length > 0){
  res.send(findUser);;
}
res.send({error: true, message: 'wrong username and/or pasword'});
});

app.listen(port, () =>
  console.log(` My App listening at http://localhost:${port}`)
);
