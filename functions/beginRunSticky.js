/*Begin a run within an existing experiment, while prioritizing a certain dataset

This function does a few things:
 - it chooses which model-hypespace/task pair should be worked on
 - it uses the hyperparameter space associated with that model to create a random hyperparameter set
 - it creates a new run
 - it updates the experiment with that new run
unlike /beginRun, however, this webhook prioritizes a certain dataset, allowing for the use case where all the modeling strategies
pertaining to a particular dataset can be completed before loading a new dataset.
 
The run itself, in terms of a document on the databse, consists of the following
 - metrics_per_epoch: a list of dicts
 - experiment_id: a reference to the experiment being run
 - experiment_name: name of experiment
 - mtpair_index: the index of the model-task pair in the experiment
 - is_completed: a bool corresponding to if the worker finished the run
 - user_id: the user which executed the run
 - user_name: the name of the user which completed the run
 - hyp: the specific hyperparameters of the search
 - model: the specific model used in this run
 - task: the specific dataset task used in this run
 
Only a single user, by user_id, can update and choose to conclude the run they created.
 
This function also adds the _id of the run to the mtpair's initiated_runs within the experiment.

The body consists of the following, simply:
------------------------------------------------------
{experiment: "<experiment name>", task: "<task_id to stick to>"}
------------------------------------------------------
experiment should correspond to an existing experiment. task can be unspecified to allow for convenient use in loops

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
  
  //trying to get an mtpair with the specified task
  if (body['task'] !== null){
    mtpair = await context.functions.execute("decideMTPair", experiment['runs_per_pair'], experiment['mtpairs'].filter(mtpair=>mtpair.task===body['task']));
  }
  
  //no mtpair works with the sticky objective (either not valid or all completed)
  if (body['task'] === null || mtpair === null){
    //getting a modle/task pair
    mtpair = await context.functions.execute("decideMTPair", experiment['runs_per_pair'], experiment['mtpairs']);
  }
  
  //returning null if the experiment has concluded
  if (mtpair === null){
    response.setBody(null)
    return
  }
  
  //getting the hyperparameter space, model ID, and task for this run
  hype_space = experiment.definition.model_groups[mtpair['model']].hype
  model = experiment.definition.model_groups[mtpair['model']].model
  task = mtpair['task']
  
  //converting hyperparameter space to hyperparameter instance
  hyp = await context.functions.execute("randomSearch", hype_space);
  
  //creating a run document
  run ={
    metrics_per_epoch : [],
    experiment_id: experiment._id,
    experiment_name: experiment.name,
    mtpair_index: mtpair.index,
    mtpair_model: mtpair.model,
    mtpair_task: mtpair.task,
    is_completed: false,
    user_id: user._id,
    user_name: user.name,
    hyp: hyp,
    model: model,
    task: task
  }
  
  //writing the document to the runs collection
  const Runs = context.services.get("mongodb-atlas").db('DB').collection('Runs');
  const result = await Runs.insertOne(run)
  const new_run = result.insertedId
  
  //adding the run to initiated_runs for the mtpair
  Experiments.updateOne(
      {_id : experiment._id},
      {$push : {["mtpairs."+mtpair.index+".initiated_runs"] : new_run}}
  )
  
  //responding with the corresponding experiment
  response.setBody(JSON.stringify(new_run))
};
