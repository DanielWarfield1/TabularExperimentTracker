/*Begin a run within an existing experiment

This function does a few things:
 - it chooses which model-hypespace/task pair should be worked on
 - it uses the hyperparameter space associated with that model to create a random hyperparameter set
 - it creates a new run
 - it updates the experiment with that new run
 
The run itself, in terms of a document on the databse, consists of the following
 - metrics_per_epoch: a list of dicts
 - experiment: a reference to the experiment being run
 - mtpair: the index of the model-task pair in the experiment
 - is_completed: a bool corresponding to if the worker finished the run
 - user_id: the user which executed the run
 - user_name: the name of the user which completed the run
 - hyp: the specific hyperparameters of the search
 
Only a single user, by user_id, can update and choose to conclude the run they created.
 
This function also adds the _id of the run to the mtpair's initiated_runs within the experiment.

The body consists of the following, simply:
------------------------------------------------------
{experiment: "<experiment name>"}
------------------------------------------------------
That should correspond to an existing experiment

*/
exports = async function({ query, headers, body}, response) {
  
  //getting authenticated user or throwing an exception
  const user = await context.functions.execute("authenticateUser", headers);
  
  //parsing the body
  body = JSON.parse(body.text())
  
  experiment = body['experiment']
  
};
