/*For registering a new experiment.

Experiments are uniquely identified by name. In order to promote ease of deployment, this script either
 - creates a new experiment
 - checks that an experiment by the same name already exists.
 
it then returns either
 - "new experiment"
 - "existing experiment"
such that these two cases can be handled, as necessary.

the saved experiment does three things:
 - keeps track of the initial configuration
 - keeps track of experiment progress by relating to "runs" for specific dataset/model pairs
 - allows for the prioritization of which mtpair should be run

an experiment gets defined in the following way. *'d fields are required in the body of the input:
------------------------------------------------------
{
  *name: "<experimentname>",
  creator_name: "<username>",
  creator_id: "<_id of user>",
  *runs_per_pair: <number of times to explore a hyperparameterspace-model/dataset pairing. May be exceeded occasionally>
  is_done: <weather or not the experiment is done. initialized to false>
  successful_runs: <num initialized to 0, incrimented at the conclusion of a successful run>
  required_runs: <num of runs required total>
  *definition: {
    data_groups:{
      group0: ['dataUID0', 'dataUID1', 'dataUID2'], group1: ['dataUID3', 'dataUID4', 'dataUID5']
    }
    model_groups:{
      model0: {model: 'modelUID0', hype: <hyperparameter dict>}, model1: {model: 'modelUID1', hype: <hyperparameter dict>}
    }
    applications:{
      group0: ["model0"],
      group1: ["model0", "model1"]
    }
  }
  mtpairs:[
    {index:0, model: 'model0', task: 'dataUID0', successful_runs:[], initiated_runs:[], is_done:false},
    {index:1, model: 'model0', task: 'dataUID1', successful_runs:[], initiated_runs:[], is_done:false},
    ...
  ]
}
------------------------------------------------------
*/

// This function is the endpoint's request handler.
exports = function({ query, headers, body}, response) {
  
  //getting authenticated user or throwing an exception
  const user = context.functions.execute("authenticateUser", headers);
  
  //parsing the body
  body = JSON.parse(body.text())
  
  //validating packet
  if (!body.hasOwnProperty('name')){throw new Error("a 'name' is required for the experiment");}
  if (!body.hasOwnProperty('runs_per_pair')){throw new Error("'runs_per_pair' is required, defining the number of hyperparameter searches for a model-hyp/dataset pairing");}
  if (!body.hasOwnProperty('definition')){throw new Error("a 'definition' is required for the experiment");}
  if (!body['definition'].hasOwnProperty('data_groups')){throw new Error("the definition must have 'data_groups', a dict of lists of tasks");}
  if (!body['definition'].hasOwnProperty('model_groups')){throw new Error("the definition must have 'model_groups',which defines models and their hyperparameter spaces");}
  if (!body['definition'].hasOwnProperty('applications')){throw new Error("the definition must have 'applications', applying models to data groups");}
  
  //iterating over all applications, all groups, and all lists of models to get model-task pairs
  var mtpairs = []
  var index = 0
  for (const [group, models] of Object.entries(body['definition']['applications'])) {
    for (const task of body['data_groups'][group]){
      for (const model of models){
        mtpairs.push({index:index, model:model, task:task, successful_runs:[], initiated_runs:[], is_done:[]})
        index += 1
      }
    }
  }
  response.setBody(JSON.stringify(mtpairs))
};
