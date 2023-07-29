/*Update Run
Add results to a given run. Generally this should be called on a per-epoch basis.
The results should also have consistency in terms of keys or values.

The body consists of the following:
------------------------------------------------------
{run: "<run_id>", metrics: {<dict of metrics>}}
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
  if (!run.user_id.equals(user._id)){
    throw new Error("active user is not the creator of the run" );
  }
  
  //making sure run isn't already ended
  if (run.is_completed){
    throw new Error("run already completed");
  }
  
  //updating run
  Runs.updateOne(
      {_id : run._id},
      {$push : {metrics_per_epoch : body['metrics']}}
  )
  
  //Successfully updated
  response.setBody('run updated')
};
