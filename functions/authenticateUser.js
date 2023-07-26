/* Returns a user object on successful auth, or throws an error. Intended as auth middleware.

to test this, test the authenticate HTTPS endpoint. This function is intended to be middleware.
*/

exports = async function(headers){
  
  //extracting the fields necessary for authentication from the header
  seceret = headers['Seceret']
  name = headers['Name']
  
  //name and seceret might be lists because of how headers are packaged
  if (Array.isArray(name)){
    name = name[0]
  }
  if (Array.isArray(seceret)){
    seceret = seceret[0]
  }
  
  //searching for user with name
  const UserData = context.services.get("mongodb-atlas").db('DB').collection('UserData');
  const user = await UserData.findOne({name: name})
  if(user === null){
    throw new Error("user name does not exist");
  }
  
  //authenticating
  const jwt = require('jsonwebtoken');
  payload = jwt.verify(user['hash'], seceret) //throws invalid signature
  
  return await user
};