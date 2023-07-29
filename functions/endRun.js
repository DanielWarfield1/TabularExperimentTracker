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
  if (run.user_id !== user._id){
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
      {$push : {["mtpairs."+rn.mtpair_index+".initiated_runs"] : new_run}}
  )
  
  //Successfully updated
  response.setBody('run ended')
};
