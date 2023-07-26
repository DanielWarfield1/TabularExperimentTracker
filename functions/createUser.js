/*Creates a user, generates a salted and hashed api token

*/

exports = async function(secretKey){
  
  var jwt = require('jsonwebtoken');
  
  const payload = {
    name: "John Doe",
    // other properties
  };

  const token = jwt.sign(payload, secretKey); 
  return token
};