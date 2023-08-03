/*Get a random hyperparameter point for a model group within an experiment

The body consists of the following, simply:
------------------------------------------------------
{experiment: "<experiment name>", model_group: "<model_group name>"}
------------------------------------------------------
That should correspond to an existing experiment

*/
exports = async function({ query, headers, body}, response) {
  
  //getting authenticated user or throwing an exception
  const user = await context.functions.execute("authenticateUser", headers);
  
  //parsing the body
  body = JSON.parse(body.text())
  
  //searching for experiment
  const Experiments = context.services.get("mongodb-atlas").db('DB').collection('Experiments');
  const experiment = await Experiments.findOne({ name: body['experiment'] })
  if (experiment === null){
    throw new Error("the provided experiment does not exist");
  }
  
  //getting the hyperparameter space for the model_group
  try{
    mg = experiment.definition.model_groups[body['model_group']].hype
  }catch (error) {
    throw new Error("could not find model group");
  }
  
  //converting hyperparameter space to hyperparameter instance
  hyp = await context.functions.execute("randomSearch", hype_space);
  
  response.setBody(JSON.stringify(hyp))
};
