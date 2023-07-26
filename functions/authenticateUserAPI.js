/* For authenticating a user, without actually doing anything

this is mostly for testing purposes, as authentication is done with a token in the header
for each request.



sample request:
----------------------------------------------------------------------------------------------
exports({
  query: {arg1: "hello",arg2: "world"},
  headers: {"Content-Type": ["application/json"], "name": ["<username>"], "seceret": ["<seceret>"]}
})
----------------------------------------------------------------------------------------------

*/

// This function is the endpoint's request handler.
exports = function({ query, headers, body}, response) {
    user = context.functions.execute("authenticateUser", headers);
    response.setBody('successfully authenticated')
};
