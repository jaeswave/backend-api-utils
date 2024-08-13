const express = require('express')
const router = express.Router()
const { createTodo, getTodos, getTodo } = require('../controllers/todo.controller')
const { authorisation } = require('../middleware/authorisation')


router.post('/todo', createTodo)

router.get('/todos', authorisation, getTodos)

router.get('/todo/:todo_id', authorisation, getTodo)





module.exports = router