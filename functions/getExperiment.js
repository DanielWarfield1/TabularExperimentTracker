/*For getting the details of a registered experiment
------------------------------------------------------
{
  experiment: "<experimentname>",
}
------------------------------------------------------

this can be tested via postman:
https://planetary-shadow-793552.postman.co/workspace/TabularExperimentTracker~acf79d30-9279-42e8-a40f-8a0090d3991d/request/28780419-058150cf-9e48-44ef-9b95-6aac2c3e28e7
*/

// This function is the endpoint's request handler.
exports = async function({ query, headers, body}, response) {
  
  //getting authenticated user or throwing an exception
  const user = await context.functions.execute("authenticateUser", headers);
  
  //parsing the body
  body = JSON.parse(body.text())
  
  //scanning for existing experiment
  if (!body.hasOwnProperty('experiment')){throw new Error("a 'experiment' field is required");}
  const Experiments = context.services.get("mongodb-atlas").db('DB').collection('Experiments');
  const exp = await Experiments.findOne({ name: body['experiment'] })
  if (exp){
    response.setBody(JSON.stringify(exp))
    return
  }
  
  throw new Error("could not find experiment")
  
};
