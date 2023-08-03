/*Get Run
gets the current data for a specified run

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
  
  response.setBody(JSON.stringify(run))
};
