/* Returns a user object on successful auth, or throws an error. Intended as auth middleware.

*/

exports = async function(name, seceret){
  
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