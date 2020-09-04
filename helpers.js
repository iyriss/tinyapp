const getUserByEmail = function(email, database) {
  for(const userId in database)
  if (database[userId].email === email) {
    return userId;
  }
};

module.exports = { getUserByEmail } ;