
module.exports = app => {
  //const products = require("./products.controller");

  var router = require("express").Router();
  const db = require("./db");

  const tasks = db.tasks;
  const completedtasks = db.completedtasks;
const Op = db.Sequelize.Op;

router.get("/getTasks",  (req, res) => { 

    tasks.findAll({raw: true })
    .then(data => {
      console.log(data)

      res.send(data);

      console.log()
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
    return res
  }
  ); 
  router.get("/getCompletedTasks",  (req, res) => { 

    completedtasks.findAll({raw: true })
    .then(data => {
      console.log(data)

      res.send(data);

      console.log()
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
    return res
  }
  );  

  router.post("/addTask",  (req, res) => { 
console.log("AddTask")
let task = req.body
console.log(task.newTask) 
        tasks.create ({ 
          taskName: task.newTask.taskName, 
          Status: task.newTask.Status,
          color:task.newTask.color
        })
            .then(data => {
              res.send(req.body);
        
              console.log(data)
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving tutorials."
              });
            });
            return res
          }
          
 /*    tasks.findAll({raw: true })
    .then(data => {
      res.send(data);

      console.log()
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
    return res */
  
  );
  router.delete("/deleteTask/:id",  (req, res) => { 
     
            console.log(req.body)
            tasks.destroy ({
              where:{
                taskId: req.params.id
              }
               })
                .then(
                  res.send({
                    message: "Task was deleted successfully!"
                  })
                )
                .catch(err => {
                  res.status(500).send({
                    message:
                      err.message || `Cannot delete Task with id=${id}. Maybe Tutorial was not found!`
                  });
                });
                return res
              }
              );
    router.delete("/deleteCompletedTask/:id",  (req, res) => { 
     
            console.log(req.body)
            completedtasks.destroy ({
              where:{
                taskId: req.params.id
              }
               })
                .then(
                  res.send({
                    message: "Task was deleted successfully!"
                  })
                )
                .catch(err => {
                  res.status(500).send({
                    message:
                      err.message || `Cannot delete Task with id=${id}. Maybe Tutorial was not found!`
                  });
                });
                return res
              }
              );
  router.post("/addToCompletedTask/:taskId", (req, res)=>{
                console.log("here1")
                console.log(req.body.task)
let localTask = req.params.task
//console.log(task) 
        completedtasks.create ({ 
          taskName: req.body.task.taskName, 
          Status: req.body.task.Status
        })
            .then(data => {
              res.send(req.body);
        
              console.log(data)
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving tutorials."
              });
            });
            return res
          

              });
  app.use('/', router);
};