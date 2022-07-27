const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()

// add connection string
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

// lets us connect to mongodb
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
// middleware parser
app.use(express.urlencoded({ extended: true }))
// middleware parser
app.use(express.json())

// read (get) the info from the database when loading page
app.get('/',async (request, response)=>{
    // convert the documents in the db into an array
    const todoItems = await db.collection('todos').find().toArray()
    // count the number of items in the array that are not completed
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    // render the data from db into the page using ejs
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

// add item to todo list
app.post('/addTodo', (request, response) => {
    // add an item to the db and give it the completed value of false
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        // log the item was added
        console.log('Todo Added')
        // refresh
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

// update (put) an item to mark as completed
app.put('/markComplete', (request, response) => {
    // find the item in the db (it find s the item using the request from the client side)
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            // set completed value to true
            completed: true
          }
    },{
        // idk
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        // log it was completed
        console.log('Marked Complete')
        // respond to client saying it was completed
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

// update (put) an item to mark as completed
app.put('/markUnComplete', (request, response) => {
    // find the item in the db (it find s the item using the request from the client side)
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            // set completed value to false
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        // log it was uncomplete
        console.log('Marked Uncmoplete')
        // respond to client saying it was uncompleted
        response.json('Marked Uncomplete')
    })
    .catch(error => console.error(error))

})

// delete and item from the db
app.delete('/deleteItem', (request, response) => {
    // find the item in the db using the data from the request and delete it 
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        // log it was deleted
        console.log('Todo Deleted')
        // respond to client saying it was deleted
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

// host the server on the whatever server/ if no server, host on port 2121
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})