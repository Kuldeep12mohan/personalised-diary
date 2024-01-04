const express = require("express");
// const { faker } = require('@faker-js/faker');

const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
const path = require("path");

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.urlencoded({ extended: true }));
const mysql = require('mysql2');
const { Console } = require("console");
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'social_app',
  password: 'apnacollege12@'
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


app.listen(port, () => {
  console.log(`listening on port ${port}`);
})

app.get("/",(req,res)=>
{
  res.render("login.ejs");
})
app.get("/user/:id",(req,res)=>
{
  let {id} = req.params;
  let q = `select * from users_info where id = '${id}'`;
  try{
  connection.query(q,(err,result)=>
  {
    if(err)throw err;
    let r = result[0];
    
    let q1 = `select thoughts from ${r.username}`;
    connection.query(q1,(err,result1)=>
    {
      if(err)throw err;
      let posts = result1;
      posts.push(r.username);
      res.render("user.ejs",{posts})
    })
  })
}
catch(err){
  res.send("error in db");
}
})

app.post("/user",(req,res)=>
{
  let {username,password} = req.body;
  let q = `select * from users_info`;
  connection.query(q,(err,result)=>
  {
    if(err)throw err;
    let r1 = result.find((p)=>username===p.username);
    let r2 = result.find((p)=>password===p.password);
    if(r1 && r2)res.redirect(`/user/${r1.id}`);
    else res.send("user not exist");
  })
})
app.post("/user/new",(req,res)=>
{
  let {username,password} = req.body;
  let q = `insert into users_info(id,username,password)values('${uuidv4()}','${username}','${password}')`;
  connection.query(q,(err,result)=>
  {
    if(err) throw err;
    console.log(result);
    let q1 = `create table ${username}(id varchar(50),thoughts varchar(100),name varchar(100) default '${username}')`;
    connection.query(q1,(err,result1)=>
    {
      if(err)throw err;
      res.redirect("/");
    })
  })
})

app.post("/user/post",(req,res)=>
{
  let {username,thoughts} = req.body;
  let q = `insert into ${username}(id,thoughts)values('${uuidv4()}','${thoughts}')`;
  connection.query(q,(err,result)=>
  {
    if(err)throw err;
    let q1 = `select id from users_info where username = "${username}"`;
    connection.query(q1,(err,result1)=>
    {
      if(err)throw err;
      let r1 = result1[0].id;
      res.redirect(`/user/${r1}`);
    })
  })
})
app.get("/post/new",(req,res)=>
{
  res.render("thoughts.ejs");
})