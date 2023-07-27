/*Decides which individual model/task pair to work on

experiments have lists of model/task pairs, which can be thought of as an atomic unit of work.
This function looks at that list of possible tasks, based on the desired number of runs, how many
runs have been completed, and how many runs have been initiated, and decides which one should be worked
on. Currently, this is done through prioritization of the least addresed mtpair. 

sample request:
----------------------------------------------------------------------------------------------
exports(10,[
        {
            "index": 0,
            "model": "model0",
            "task": "dataUID0",
            "successful_runs":[],
            "initiated_runs":["id1", "id2"],
            "is_done": false
        },{
            "index": 1,
            "model": "model1",
            "task": "dataUID0",
            "successful_runs":["id3"],
            "initiated_runs":["id3"],
            "is_done": false
        },{
            "index": 2,
            "model": "model2",
            "task": "dataUID0",
            "successful_runs":[],
            "initiated_runs":["id4"],
            "is_done": false
        },{
            "index": 3,
            "model": "model3",
            "task": "dataUID0",
            "successful_runs":[1,2,3,4,5,6,7,8,9,10,11,12],
            "initiated_runs":["id5"],
            "is_done": false
        },{
            "index": 4,
            "model": "model4",
            "task": "dataUID0",
            "successful_runs":[],
            "initiated_runs":["id6"],
            "is_done": false
        }
    ])
----------------------------------------------------------------------------------------------
that should either output the mtpair at index 2 or 4

the arguments are (desired_runs, mtpairs)

if all mtpairs have a length of successful_runs equal to or exceeding desired_runs, then nothing is returned
*/

exports = async function(desired_runs, mtpairs){
  /*function that prioritizes under-completed mtpairs
   - is mtpair not complete?
   - does it have the lowest number of completed runs?
   - does it have the lowest number of initiated runs?
   - select a random one
   
  TODO this could be more memory efficient
  */
  
  const uncompleted = mtpairs.filter(item => item.successful_runs.length < desired_runs);
  if (uncompleted.length == 0){
    return null
  }
  //filtering by the mtpairs containing the lowest number of completed runs
  const min_completed_length = uncompleted.reduce((prev, curr) => prev.successful_runs.length < curr.successful_runs.length ? prev : curr).successful_runs.length;
  const min_completed = uncompleted.filter(item => item.successful_runs.length === min_completed_length);
  if (min_completed.length == 0){
    return null
  }
  //filtering by the mtpairs containing the lowest number of initiated runs
  const min_init_length = min_completed.reduce((prev, curr) => prev.initiated_runs.length < curr.initiated_runs.length ? prev : curr).initiated_runs.length;
  const min_init = min_completed.filter(item => item.initiated_runs.length == min_init_length);
  if (min_init.length == 0){
    return null
  }
  
  //randomly selecting a run from the remainder
  const mtpair = min_init[Math.floor(Math.random() * min_init.length)];
  
  return mtpair
};