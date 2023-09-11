/* Get Results

given a certain experiment, return recorded results for each mtpair

------------------------------------------------------
{experiment: "<experimentname>"}
------------------------------------------------------

TODO reduce query time
*/

// This function is the endpoint's request handler.
exports = async function({ query, headers, body}, response) {

  // getting authenticated user or throwing an exception
  const user = await context.functions.execute("authenticateUser", headers);
  
  // parsing the body
  body = JSON.parse(body.text())
  
  //scanning for existing experiment
  if (!body.hasOwnProperty('experiment')){throw new Error("a 'experiment' field is required");}
  const Experiments = context.services.get("mongodb-atlas").db('DB').collection('Experiments');
  const exp = await Experiments.findOne({ name: body['experiment'] })
  if (exp){
    
    //iterating over all mtpairs
    const Runs = context.services.get("mongodb-atlas").db('DB').collection('Runs');
    for (let i = 0; i < exp['mtpairs'].length; ++i) {
        const mtpair = exp['mtpairs'][i];
        
        //iterating over all successful runs
        for (let j = 0; j < mtpair['successful_runs'].length; ++j){
          
          //getting successful run id
          run_id = exp['mtpairs'][i]['successful_runs'][j]
          
          //getting data for run
          const run = await Runs.findOne({ _id: run_id})
          
          //replacing object id with the run itself
          exp['mtpairs'][i]['successful_runs'][j] = run
          
        }
    }
    
    response.setBody(JSON.stringify(exp))
    return
  }
  
  throw new Error("could not find experiment")
};
