/*Function which, given a hyperparameter space, finds a new hyperparameter through random search

these are defined virtually identically to WandB sweeps:
https://docs.wandb.ai/guides/sweeps/define-sweep-configuration#:~:text=A%20W%26B%20Sweep%20combines%20a,form%20of%20a%20sweep%20configuration.

each parameter is a dictionary consisting of a distribution and some other key value pairs.
 - {distribution:constant, value:2.71828}
 - {distribution:categorical, values:["foo", "bar"]}
 - {distribution:int_uniform, min:0, max:2}
 - {distribution:float_uniform, min:0.0, max:2.5}
 - {distribution:log_uniform, min:0.0, max:2.5}
 - {distribution:log_norm, mu:-6, sigma:0.5}

A hyperparameter space is defined by an obeect containing key value pairs. The key is the name of the
parameter and the value is a dictionary similar to one of the ones above.

sample request:
----------------------------------------------------------------------------------------------
exports({
  param1: {distribution:'constant', value:2.71828},
  param2: {distribution:'categorical', values:["foo", "bar"]},
  param3: {distribution:'int_uniform', min:0, max:2},
  param4: {distribution:'float_uniform', min:0.0, max:2.5},
  param5: {distribution:'log_uniform', min:0.001, max:2.5}
})
----------------------------------------------------------------------------------------------

*/

//calculate a value from a log uniform sampling between two values, curtosy of ChatGPT
function logUniformDistribution(min, max) {
  const logMin = Math.log(min);
  const logMax = Math.log(max);

  // Generate a random number from a uniform distribution between 0 and 1
  const u = Math.random();

  // Calculate the logarithm of the random number with uniform distribution between log(min) and log(max)
  const logUniformRandom = u * (logMax - logMin) + logMin;

  // Convert the logarithm back to the original scale
  const logUniformValue = Math.exp(logUniformRandom);

  return logUniformValue;
}

function logNorm(mu, sigma) {
    // Generate a normally distributed random variable
    const normalRandom = function() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };

    // Calculate log-normal random variable
    const logNormalRandom = Math.exp(mu + sigma * normalRandom());

    return logNormalRandom;
}

//main function
exports = async function(paramSpace){
  /*iterates over every parameter and finds a value based on
  it's respective distribution
  */
  
  for (const [key, value] of Object.entries(paramSpace)) {
    if (value['distribution'] === 'constant'){
      paramSpace[key] = value['value']
    }else if(value['distribution'] === 'categorical'){
      var index = Math.floor(Math.random() * value['values'].length);
      paramSpace[key] = value['values'][index]
    }else if(value['distribution'] === 'int_uniform'){
      paramSpace[key] = Math.floor(Math.random() * (value['max'] - value['min'] + 1) + value['min'])
    }else if(value['distribution'] === 'float_uniform'){
      paramSpace[key] = Math.random() * (value['max'] - value['min']) + value['min']
    }else if(value['distribution'] === 'log_uniform'){
      paramSpace[key] = logUniformDistribution(value['min'], value['max'])
    }else if(value['distribution'] === 'log_norm'){
      paramSpace[key] = logNorm(value['mu'], value['sigma'])
    }
  }
  return paramSpace
};