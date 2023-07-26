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
  const user = context.functions.execute("authenticateUser", headers);
};
