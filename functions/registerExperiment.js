/*For registering a new experiment.

Experiments are uniquely identified by name. In order to promote ease of deployment, this script either
 - creates a new experiment
 - checks that an experiment by the same name already exists.
 
it then returns
 - "new experiment"
 - "existing experiment"
 
TODO: as the definition of an experiment becomes more crystalized, the proposed experiment
might be compared against the existing experiment's definition to gauge compatability

exports({
  query: {arg1: "hello",arg2: "world"},
  headers: {"Content-Type": ["application/json"], "name": "<username>", "seceret": "<seceret"}
})

*/

// This function is the endpoint's request handler.
exports = function({ query, headers, body}, response) {
  
  try{
    const result = context.functions.execute("authenticateUser", headers['name'],  headers['seceret']);
  }catch (err){
    return
  }
  
    // Data can be extracted from the request as follows:

    // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
    const {arg1, arg2} = query;

    // Headers, e.g. {"Content-Type": ["application/json"]}
    const contentTypes = headers["Content-Type"];

    // Raw request body (if the client sent one).
    // This is a binary object that can be accessed as a string using .text()
    const reqBody = body;

    console.log("arg1, arg2: ", arg1, arg2);
    console.log("Content-Type:", JSON.stringify(contentTypes));
    console.log("Request body:", reqBody);

    // You can use 'context' to interact with other application features.
    // Accessing a value:
    // var x = context.values.get("value_name");

    // Querying a mongodb service:
    // const doc = context.services.get("mongodb-atlas").db("dbname").collection("coll_name").findOne();

    // Calling a function:
    // const result = context.functions.execute("function_name", arg1, arg2);

    // The return value of the function is sent as the response back to the client
    // when the "Respond with Result" setting is set.
    return  "Hello World!";
};
