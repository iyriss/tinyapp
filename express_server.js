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

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  let templateVars = { urls: urlDatabase, user: users[user_id] };
  res.render("urls_index", templateVars);
});

//This app.get("/urls/new", should be above app.get("/urls/:id", ...)
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  let templateVars = { user: users[user_id] };
  res.render("urls_new", templateVars);
});

//REGISTER
app.get("/register", (req, res) => {
  //Quite eso para cambiar a user_id
  // let templateVars = { username: req.cookies["username"] };
  // console.log(req.cookies["username"])
  const user_id = req.cookies["user_id"];
  let templateVars = { user: users[user_id] };
  res.render("registration", templateVars);
});

const findUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
}; 

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.send("Email/Password fields can't be empty");
  }

  if (findUserByEmail(email)) {
    return res.send ('Error status: 400. Email already registered.')
  }

  const id = generateRandomString();
  const newUser = { 
    id: id, 
    email: email,
    password: password
  }


  users[id] = newUser;
  console.log("users are now: ", users)
  res.cookie("user_id", id)
  res.redirect('/urls');
  
})

//LOG IN
app.post("/login", (req, res) => {
  console.log(req.body.user)
  const value = req.body.user;
  res.cookie("user_id", value);
  res.redirect("/urls");
});

//LOG OUT
app.post("/logout", (req, res) => {
  console.log("test")
  // const value = req.body.username;
  // res.cookie("username", value);
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => { 
  const urlToRemove = req.params.shortURL;
  delete urlDatabase[urlToRemove]
  res.redirect("/urls")
});

//UPDATE
app.post("/urls/:id/rohit", (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.longURL;
res.redirect("/urls");
});


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
  const user_id = req.cookies["user_id"];
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: users[user_id] };
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
