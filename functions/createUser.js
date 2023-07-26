/*Creates a user, generates a seceret used for auth, and stores a hash of that seceret allong with
user name.

copy and paste this into the testing console:
  exports('<user name>')
then run.

Copy the seceret and send it to the user.

sample request:
----------------------------------------------------------------------------------------------
exports({'<username>'})
----------------------------------------------------------------------------------------------
*/

exports = async function(name){
  
  //searching for user with name
  const UserData = context.services.get("mongodb-atlas").db('DB').collection('UserData');
  if(await UserData.findOne({name: name}) !== null){
    throw new Error("user already exists");
  }
  
  //creating seceret used in auth
  const crypto = require('crypto');
  const seceret = crypto.randomBytes(64).toString('hex');
  
  //creating hashed store of seceret
  const jwt = require('jsonwebtoken');
  const payload = {
    name: name,
  };
  const hash = jwt.sign(payload, seceret); 
  
  //creating new user
  UserData.insertOne({name: name, hash: hash, createdOn: new Date()})
  
  return seceret
};