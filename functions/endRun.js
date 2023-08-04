/*End Run
Ends a run, once a model is completed

The body consists of the following:
------------------------------------------------------
{run: "<run_id>"}
------------------------------------------------------
*/

exports = async function({ query, headers, body}, response) {
  /*
  TODO: could probably optimize queries better
  */
  
  //getting authenticated user or throwing an exception
  const user = await context.functions.execute("authenticateUser", headers);
  
  //parsing the body
  body = JSON.parse(body.text())
  
  //finding run
  const Runs = context.services.get("mongodb-atlas").db('DB').collection('Runs');
  const run = await Runs.findOne({ _id: new BSON.ObjectId(body['run'])})
  if (run === null){
    throw new Error("specified run did not exist");
  }
  
  //making sure updater is owner
  //TODO: somewhere there's an id represented as a string
  if (run.user_id.str !== user._id.str){
    throw new Error("active user is not the creator of the run");
  }
  
  //making sure run isn't already ended
  if (run.is_completed){
    throw new Error("run already completed");
  }
  
  //updating run
  Runs.updateOne(
      {_id : run._id},
      {$set : {is_completed : true}}
  )
  
  //adding to completed runs for the coresponding mtpair
  const Experiments = context.services.get("mongodb-atlas").db('DB').collection('Experiments');
  Experiments.updateOne(
      {_id : run.experiment_id},
      {$push : {["mtpairs."+run.mtpair_index+".successful_runs"] : run._id}}
  )
  
  //checking for completion, and marking as complete if applicable
  const experiment = await Experiments.findOne({ _id: run.experiment_id})
  if (experiment.runs_per_pair <= experiment['mtpairs'][run.mtpair_index]['successful_runs'].length){
    Experiments.updateOne(
        {_id : run.experiment_id},
        {$set : {["mtpairs."+run.mtpair_index+".is_done"] : true}}
    )
  }
  
  //adding to the number of completed runs. This is not a perfect proxy for completion, but it's pretty good
  //in theory some tasks can over-completed, easpecially when there's not a lot of tasks and a lot of workers
  Experiments.updateOne(
      {_id : run.experiment_id},
      {$inc : {successful_runs : 1}}
  )
  
  //Successfully updated
  response.setBody('run ended')
};
