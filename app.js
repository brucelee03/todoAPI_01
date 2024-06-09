// Import required modules
const format = require('date-fns/format');
const isValid = require('date-fns/isValid');
const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

// Create an instance of the express app
const app = express();

// Enable JSON parsing for request bodies
app.use(express.json());

// Define the path to the SQLite database file
const dbPath = path.join(__dirname, 'todoApplication.db');

// Initialize the database connection
let db = null;

// Function to initialize the database server
const initializeDBServer = async () => {
  try {
    // Open the database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Start the server and listen on port 3000
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000');
    });
  } catch (e) {
    // Handle database connection errors
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

// Initialize the database server
initializeDBServer();

// Middleware function to check the validity of the request body
const checkRequestBodyValidity = (request, response, next) => {
  const requestBody = request.body;
  const { todo, priority, status, category, dueDate } = requestBody;

  // Define valid status, priority, and category arrays
  const statusArray = ['TO DO', 'IN PROGRESS', 'DONE'];
  const priorityArray = ['HIGH', 'LOW', 'MEDIUM'];
  const categoryArray = ['WORK', 'LEARNING', 'HOME'];

  // Check the validity of each field
  const isStatusValid = statusArray.includes(status);
  const isPriorityValid = priorityArray.includes(priority);
  const isCategoryValid = categoryArray.includes(category);
  const isDateValid = isValid(new Date(dueDate));

  let invalidMsg;
  let isValidRequestBody = true;

  // Check for invalid fields and set the error message
  if (status!== undefined &&!isStatusValid) {
    invalidMsg = 'Todo Status';
    isValidRequestBody = false;
  } else if (priority!== undefined &&!isPriorityValid) {
    invalidMsg = 'Todo Priority';
    isValidRequestBody = false;
  } else if (category!== undefined &&!isCategoryValid) {
    invalidMsg = 'Todo Category';
    isValidRequestBody = false;
  } else if (dueDate!== undefined &&!isDateValid) {
    invalidMsg = 'Due Date';
    isValidRequestBody = false;
  }

  // If the request body is valid, call the next middleware function
  if (isValidRequestBody === true) {
    next();
  } else {
    // If the request body is invalid, return a 400 error with an error message
    response.status(400);
    response.send(`Invalid ${invalidMsg}`);
  }
};

// Middleware function to check the validity of the query parameters
const checkValidity = (request, response, next) => {
  const requestQuery = request.query;
  const { status, priority, category } = request.query;
  const { date } = request.query;

  // Define valid status, priority, and category arrays
  const statusArray = ['TO DO', 'IN PROGRESS', 'DONE'];
  const priorityArray = ['HIGH', 'LOW', 'MEDIUM'];
  const categoryArray = ['WORK', 'LEARNING', 'HOME'];

  // Check the validity of each field
  const isStatusValid = statusArray.includes(requestQuery.status);
  const isPriorityValid = priorityArray.includes(requestQuery.priority);
  const isCategoryValid = categoryArray.includes(requestQuery.category);
  const isDateValid = isValid(new Date(requestQuery.date));

  let invalidMsg;
  let isValidTodo = true;

  // Check for invalid fields and set the error message
  if (requestQuery.status!== undefined &&!isStatusValid) {
    invalidMsg = 'Todo Status';
    isValidTodo = false;
  } else if (requestQuery.priority!== undefined &&!isPriorityValid) {
    invalidMsg = 'Todo Priority';
    isValidTodo = false;
  } else if (requestQuery.category!== undefined &&!isCategoryValid) {
    invalidMsg = 'Todo Category';
    isValidTodo = false;
  } else if (requestQuery.date!== undefined &&!isDateValid) {
    invalidMsg = 'Due Date';
    isValidTodo = false;
  }

  // If the query parameters are valid, call the next middleware function
  if (isValidTodo === true) {
    next();
  } else {
    // If the query parameters are invalid, return a 400 error with an error message
    response.status(400);
    response.send(`Invalid ${invalidMsg}`);
  }
};

// GET TODO LIST API 1
app.get('/todos/', checkValidity, async (request, response) => {
  const requestQuery = request.query;

  // Define functions to check for specific query parameters
  const hasStatusProperty = requestQuery => {
    return requestQuery.status!== undefined;
  };
  const hasPriorityProperty = requestQuery => {
    return requestQuery.priority!== undefined;
  };
  const hasPriorityAndStatusProperty = requestQuery => {
    return (
      requestQuery.priority!== undefined && requestQuery.status!== undefined
    );
  };
  const hasCategoryProperty = requestQuery => {
    return requestQuery.category!== undefined;
  };
  const hasCategoryAndStatusProperty = requestQuery => {
    return (
      requestQuery.category!== undefined && requestQuery.status!== undefined
    );
  };
  const hasCategoryAndPriorityProperty = requestQuery => {
    return (
      requestQuery.category!== undefined && requestQuery.priority!== undefined
    );
  };

  let getTodosQuery = '';
  const { search_q = '', priority, status, category } = request.query;

  // Construct the SQL query based on the query parameters
  switch (true) {
    case hasStatusProperty(request.query):
      getTodosQuery = `
        SELECT 
          id,
          todo,
          category,
          priority,
          status,
          due_date as dueDate
        FROM todo 
        WHERE 
          todo LIKE '%${search_q}%'
          AND status = '${status}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
        SELECT 
          id,
          todo,
          category,
          priority,
          status,
          due_date as dueDate
        FROM todo 
        WHERE
          todo LIKE '%${search_q}%'
          AND priority = '${priority}';`;
      break;
    case hasPriorityAndStatusProperty(request.query):
      getTodosQuery = `
        SELECT 
          id,
          todo,
          category,
          priority,
          status,
          due_date as dueDate
        FROM todo 
        WHERE
          todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          AND status = '${status}';`;
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
        SELECT 
          id,
          todo,
          category,
          priority,
          status,
          due_date as dueDate
        FROM todo 
        WHERE
          todo LIKE '%${search_q}%'
          AND category = '${category}';`;
      break;
    case hasCategoryAndStatusProperty(request.query):
      getTodosQuery = `
        SELECT 
          id,
          todo,
          category,
          priority,
          status,
          due_date as dueDate
        FROM todo 
        WHERE
          todo LIKE '%${search_q}%'
          AND category = '${category}'
          AND status = '${status}';`;
      break;
    case hasCategoryAndPriorityProperty(request.query):
      getTodosQuery = `
        SELECT 
          id,
          todo,
          category,
          priority,
          status,
          due_date as dueDate
        FROM todo 
        WHERE
          todo LIKE '%${search_q}%'
          AND category = '${category}'
          AND priority = '${priority}';`;
      break;
    default:
      getTodosQuery = `
      SELECT
        id,
        todo,
        category,
        priority,
        status,
        due_date as dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }

  // Execute the SQL query and return the result
  const todos = await db.all(getTodosQuery);
  response.send(todos);
});

// GET TODO API 2
app.get('/todos/:todoId/', checkValidity, async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
  SELECT 
    id,
    todo,
    category,
    priority,
    status,
    due_date as dueDate
  FROM todo 
  WHERE id = '${todoId}';`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

// GET AGENDA DUE DATE API 3
app.get('/agenda/', checkValidity, async (request, response) => {
  const { date } = request.query;
  const newDate = format(new Date(date), 'yyyy-MM-dd');
  const getAgendaDueDate = `
  SELECT
    id,
    todo,
    category,
    priority,
    status,
    due_date as dueDate
  FROM todo 
  WHERE due_date = '${newDate}';`;
  const agendaDueDate = await db.all(getAgendaDueDate);
  response.send(agendaDueDate);
});

// Create Todo API 4
app.post('/todos/', checkRequestBodyValidity, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const formatDate = format(new Date(dueDate), "yyyy-MM-dd");
  const updateTheDatabaseQuery = `
  INSERT INTO 
    todo (id, todo, category, priority, status, due_date)
  VALUES 
    ('${id}', '${todo}', '${category}', '${priority}', '${status}', '${formatDate}');`;
  try {
    // Execute the SQL query to insert a new todo
    await db.run(updateTheDatabaseQuery);
    response.send(`Todo Successfully Added`);
  } catch (e) {
    // Handle database errors
    response.status(400);
    response.send('Got Error');
  }
});

// UPDATE THE TODO API 5
app.put(
  '/todos/:todoId/',
  checkValidity,
  checkRequestBodyValidity,
  async (request, response) => {
    const { todoId } = request.params;
    const requestBody = request.body;
    let updateColumn = '';
    switch (true) {
      case requestBody.status!== undefined:
        updateColumn = 'Status';
        break;
      case requestBody.priority!== undefined:
        updateColumn = 'Priority';
        break;
      case requestBody.todo!== undefined:
        updateColumn = 'Todo';
        break;
      case requestBody.category!== undefined:
        updateColumn = 'Category';
        break;
      case requestBody.dueDate!== undefined:
        updateColumn = 'Due Date';
        break;
    }
    const priviousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
    const priviousTodo = await db.get(priviousTodoQuery);
    const {
      todo = priviousTodo.todo,
      priority = priviousTodo.priority,
      status = priviousTodo.status,
      category = priviousTodo.category,
      dueDate = priviousTodo.dueDate,
    } = request.body;
    const updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);
  },
);

// DELETE THE TODO API 6
app.delete('/todos/:todoId', checkValidity, async (request, response) => {
  const { todoId } = request.params;
  const deleteTheQuery = await db.run(`
  DELETE FROM todo WHERE id = '${todoId}'
  `);
  response.send('Todo Deleted');
});

// Export the express app
module.exports = app;