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
  
  //updating run
  Runs.updateOne(
      {_id : run._id},
      {$push : {metrics_per_epoch : body['metrics']}}
  )
};
