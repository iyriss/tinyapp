const getUserByEmail = function(email, database) {
  for (const userId in database)
    if (database[userId].email === email) {
      return userId;
    }
};

const generateRandomString = () => {
  let randomUrl = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    randomUrl += chars[Math.round(Math.random() * (chars.length))];
  } return randomUrl;
};

const urlsForUser = (id, urlDatabase) => {
  const urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };