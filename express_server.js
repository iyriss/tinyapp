const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(morgan('dev'));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

function generateRandomString() {
  let randomUrl = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length ; i++) {
    randomUrl += chars[Math.round(Math.random() * (chars.length))]
  } return randomUrl;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//This app.get("/urls/new", should be above app.get("/urls/:id", ...)
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Login route
app.post("/login", (req, res) => {
  const value = req.body.username;
  res.cookie("username", value);
  res.redirect("/urls");
})

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => { 
  const urlToRemove = req.params.shortURL;
  delete urlDatabase[urlToRemove]
  res.redirect("/urls")
})

//UPDATE
app.post("/urls/:id/rohit", (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.longURL;
res.redirect("/urls");
})


app.post("/urls", (req, res) => {
  //se genera un randomString y se asigna a lo que el cliente escribio como long URL
  //y se guarada en urlDatabase
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  });
  //Hasta aqui genera un short URL que se muestra en my URLS guardado

//urls_show:
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
