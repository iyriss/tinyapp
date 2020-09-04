const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ["key"],
}));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const { getUserByEmail } = require('./helpers')

function generateRandomString() {
  let randomUrl = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    randomUrl += chars[Math.round(Math.random() * (chars.length))];
  } return randomUrl;
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const urlsForUser = (id) => {
  const urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  // console.log('res.cookie:', req.cookies);
  // console.log('user_id:', user_id);
  // console.log('all the users:', users);
  let templateVars = { urls: urlsForUser(user_id), user: users[user_id] };
  // console.log('template vars is: get/urls', templateVars);
  res.render("urls_index", templateVars);
});

//This app.get("/urls/new", should be above app.get("/urls/:id", ...)
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = { user: users[user_id] };
  // console.log('WHAT IS THIS', user_id);
  if (!user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//REGISTER
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = { user: users[user_id] };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email/Password fields can't be empty");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send('Error status: 400. Email already registered.');
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: id,
    email: email,
    password: hashedPassword
  };

  users[id] = newUser;
  // console.log("users are now: ", users);
  req.session.user_id = id;
  res.redirect('/urls');
});
console.log(getUserByEmail("user2@example.com", users));
//LOG IN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = getUserByEmail(email, users);
  if (!email || !password) {
    return res.status(403).send("🚫 Email/Password fields can't be empty");
  }
  if (!userId) {
    return res.status(403).send("🚫 Wrong email");
  }
  console.log('user.password equals' , users[userId].password, '--', password);
  // const hashedPassword = bcrypt.hashSync(password, 10);
  if (!bcrypt.compareSync(password, users[userId].password)) {
  // if(user.password !== password){
    return res.status(403).send("🚫 Wrong password, try again.");
  }
console.log('heypassoooooooord', userId);
  req.session.user_id = userId;
  // res.cookie("user_id", user["id"]) no more cookies
  res.redirect('/urls');
});
  
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = { urls: urlDatabase, user: users[user_id] };
  res.render("login", templateVars);
});


//LOG OUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const urlToRemove = req.params.shortURL;
  if (urlDatabase[urlToRemove].userID === userID) {
    delete urlDatabase[urlToRemove];
  }
  console.log('urls database', urlDatabase);
  res.redirect("/urls");
});

//UPDATE
app.post("/urls/:id/rohit", (req, res) => {
  let id = req.params.id;
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  //se genera un randomString y se asigna a lo que el cliente escribio como long URL
  //y se guarada en urlDatabase
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {"longURL": req.body.longURL, "userID": userID};

  // console.log('this is our console log: ', urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});
//Hasta aqui genera un short URL que se muestra en my URLS guardado

//urls_show:
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userID) {
    return res.status(400).send("Please log in");
  } else if (urlDatabase[shortURL].userID !== userID) {
    return res.status(400).send("This url doesn't belong to you");
  }

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[userID] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
