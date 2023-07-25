/*Sample Request (paste this in the console):
exports({"Content-Type": ["application/json"], "apiKey": "<api key>"})
*/

exports = async function(header){
  /*Checks if a header is from a valid user
  ---
  each request has to be associated with a specific user with a valid API key. This should be pased in the initial request as a header.
  This function ingests the header, compares it to existing API keys, and returns the user that key belongs to. The header should look
  something like the following:
  
  headers: {"Content-Type": ["application/json"], "apiKey": "<api key>"}
  ---
  inputs:
   - header: the request received
  output:
   - the user or null
  */
  
  const credentials = app.Credentials.apiKey(header["apiKey"]);
  // Authenticate the user
  const user = await app.logIn(credentials);
  
  return user
};