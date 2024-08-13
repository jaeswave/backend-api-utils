
const { Todo } = require('../models/todo.model');
const { validateTodo } = require('../validations/todo.validation')
const { v4: uuidv4 } = require('uuid'); 
const data = require('../messages')



const createTodo = async(req, res) => {

    try{
        const { customer_id, todo_name, todo_description  } = req.body
        //valodating the request body
        const { error } = validateTodo(req.body)
        if(error != undefined) throw new Error(error.details[0].message)
        //checking if the customer exist
        const checkIfTodoExist = await Todo.findOne({where:{ todo_name: todo_name} })
        if(checkIfTodoExist != null ) throw new Error('A todo name already exist ')
        await Todo.create({
            todo_id: uuidv4(),
            todo_name: todo_name,
            todo_description: todo_description,
            customer_id: customer_id
        })
        res.status(200).json({
            status: data.successStatus,
            message: 'Todo created successfully'
        })

    }catch(error){

        res.status(400).json({
            status: data.errorStatus,
            message: error.message
        })
    }

}

const getTodos = async(req, res) => {
    try{
        const { customer_id } = req.params //passd from the middleware  
        const todos = await Todo.findAll({where:{ customer_id: customer_id, is_deleted: false }})
        res.status(200).json({
            status: "success",
            message: "Todos fetched successfully",
            data: todos
        })
    }catch(error){
        res.status(400).json({
            status: "error",
            message: error.message
        })
    }
}


const getTodo = async(req, res) => {
    try{
        const { todo_id } = req.params
        const { customer_id } = req.params //passd from the middleware
        const todo = await Todo.findOne({where:{ todo_id: todo_id, is_deleted: false, customer_id: customer_id }})
        console.log("todo" , todo)
        res.status(200).json({
            status: data.successStatus,
            message: data.todoSuccess,
            data: todo
        })
    }catch(error){
        res.status(400).json({
            status: data.errorStatus,
            message: error.message
        })
    }
}

module.exports = { createTodo, getTodos, getTodo }