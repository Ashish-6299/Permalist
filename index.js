import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "111222",
  port: 5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

async function getItems(){
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  return result.rows;
}

app.get("/", async (req, res) => {
  items = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try{
    await db.query("INSERT INTO items (title) VALUES ($1);", [item]);
    items.push({ title: item });
    res.redirect("/");
  } catch(err){
    console.error(err);
  }
});

app.post("/edit", async (req, res) => {
  const updatedItem = req.body.updatedItemTitle;
  const itemId = req.body.updatedItemId;
  try{
    await db.query("UPDATE items SET title = ($1) WHERE id = $2;", [updatedItem, itemId]);
    res.redirect("/");
  } catch(err){
    console.error(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try{
    await db.query("DELETE FROM items WHERE id = $1;", [id]);
    res.redirect("/");
  } catch(err){
    console.error(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
