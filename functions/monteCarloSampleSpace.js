/*Monte Carlo Sample Space
take a hyperparameter space definition, and apply some number of random searches to it, and return the results.
This is for being able to test definitions, plot, and understand the distribution settings.

if no number of iterations is specified, it will default to 999 iterations, which is the max number. This is set to 999
because 1000 (including the main thread) is the maximum allowable number of threads. Also, 999 should be sufficient for
sampling pretty much any distribution.

the general format of the body should be akin to
{"hype": <hyperparameter space dict>, "n": <integer number of iterations>}

expects a valid hyperparameter space definition, as is used in an experiment definiton:
exports({body: '{"hype": {"n_estimators": {"distribution": "log_norm", "mu": 4.605170185988092, "sigma": 0.6931471805599453}, "learning_rate": {"distribution": "log_norm", "mu": -2.3025850929940455, "sigma": 0.9162907318741551}, "num_leaves": {"distribution": "int_uniform", "min": 10, "max": 60}, "max_depth": {"distribution": "int_uniform", "min": -1, "max": 12}, "min_data_in_leaf": {"distribution": "int_uniform", "min": 10, "max": 30}, "lambda_l1": {"distribution": "log_uniform", "min": 0, "max": 100}, "lambda_l2": {"distribution": "log_uniform", "min": 0, "max": 100}, "min_gain_to_split": {"distribution": "log_uniform", "min": 0, "max": 15}, "bagging_fraction": {"distribution": "float_uniform", "min": 0.2, "max": 1}, "bagging_freq": {"distribution": "int_uniform", "min": 0, "max": 3}, "feature_fraction": {"distribution": "float_uniform", "min": 0.2, "max": 1}}, "n": 10}'})

*/

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

exports = async function({ query, headers, body}, response) {
  
  let n = 999;
  let res_ls = [];
  
  //normal run
  if (true){
    //getting authenticated user or throwing an exception
    const user = context.functions.execute("authenticateUser", headers);
    
    //parsing the body
    body = JSON.parse(body.text())
    
    //getting the nymber of iterations, if specified
    if (body.hasOwnProperty('n')){
      n = body['n']
      
      //making sure it's in the proper range
      if (!isInt(n)){throw new Error("'n' should be an integer");}
      if (n<1 || n>1000){throw new Error("'n' should be an int between 1 and 1000");}
    }
    
    
  //testing
  }else{
    body = JSON.parse(body)
  }
  
  for (let i = 0; i < n; i++) {
  	res_ls.push(context.functions.execute("randomSearch", body['hype']));
  }
  
  //converting to object for json stringification
  res_ls = Object.assign({}, res_ls);
  
  // return JSON.stringify(res_ls) //<- for testing
  response.setBody(JSON.stringify(res_ls))
};
