# Tabular Experiment Tracker

current WIP in active development

This is a custom test orchestrator and logger inspired by WandB sweeps, but with some application specific functionality. It's built on MongoDB hosted Data Services and Application Services. The idea is for certain models, whith certain hyperparameters, to be able to be trained on certain data sets. As apposed to WandB sweeps which attempt to answer the question of "which modeling setup is the best solution for a given task" this orchestrator attempts to answer the question "how does a set of models behave across a set of tasks". As a result it contains multiple levels of search.

We're dealing with multiple models with multiple hyperparameter search spaces across multiple datasets with multiple problem and feature space types. Generally, the workflow looks like this:

``` Diagrams Generated with textik.com
+---------------------+         +------------------+    +------------------+
| Define a model which|         |Create a new      |    |Get dataset, model|
| can train off X/y   |-------> |experiment or     |    |and hyps.         |
| and predict on X    |         |connect to a      |    | - train          |
| in the model module |         |previous one with |    | - validate       |
+---------------------+         |identicle config  |--> | - test           |
                                |or by name        |    |log all results   |
+---------------------+         |                  |    |                  |
| Define an experiment|-------> |                  |    |                  |
+---------------------+         +------------------+    +------------------+
```

These are the core goals:
1. singly run iterations are as small as possible (no training a hyperparameter space on every single dataset)
2. be able to run arbitrary models in this framework, and get readable results across several dimensions of analysis
3. simply and conveniently launch, monitor, and continue experiments
4. train, validate, and test hyperparameters for each epoch, for simplicities sake

The task of the orchestrator, in this whole mess, is to:
1. record the experiments
2. record experiment results
3. tell workers what should be run

in order to get this system working some other modules will have to exist. Currently all the general components are imagined to be something like this:
```
+-------------------------+     +-------------------------+
| Logical Resources       |     | Informational Resources |
+-------------------------+     +-------------------------+
                                                           
  Model Module                    Experiment Collection    
  +---------------------+         +---------------------+  
  | Models which can    |         | - Holds the exp.    |  
  |  - train on x/y     |         | definition          |  
  |  - predict on x     |         | - holds a unique ID |  
  | can be grabbed from |         | - humanreadable name|  
  | importable module   |         |                     |  
  +---------------------+         +---------------------+  
                                                           
  Data Loader Module              Run Collection           
  +---------------------+         +---------------------+  
  | Can load data by    |         | - Holds individual  |  
  | index, suite, or    |         | runs within a given |  
  | task. Exposes X/y.  |         | experiment          |  
  | handles t/v/t parti.|         | - the model         |  
  |                     |         | - the dataset       |  
  +---------------------+         | - the hyperparameters  
                                  | - a list of results |  
  Experiment Definition           | on a per-epoch basis|  
  +---------------------+         | - weather or not the|  
  | - List of models    |         | run was ended       |  
  | - Map models to     |         | - the UTC the run   |  
  | suites              |         | was started         |  
  | - map models to     |         +---------------------+  
  | list of hyps,       |                                  
  | their min and max   |                                  
  | and distribution    |                                  
  | type                |                                  
  +---------------------+                                  
                                                           
  Orchestration Module                                     
  +---------------------+                                  
  | Given an Experiment |                                  
  | Space, and          |                                  
  | Experiment history, |                                  
  | this module decides |                                  
  | which model to run  |                                  
  | with which hype.    |                                  
  | on which dataset    |                                  
  |                     |                                  
  | also handles logging|                                  
  +---------------------+                                 
```
the thing in this repo is the "orchestration module", which isn't a module but rather a database and application service. The "informational resources" reside within the database.

This all function with HTTP API requests. In order to retain some level of security, each request is authenticated with an API key.

https://www.mongodb.com/docs/atlas/app-services/
