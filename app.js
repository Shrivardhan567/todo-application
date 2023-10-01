const express = require("express");
const app = express();
app.use(express.json());
module.exports = app;
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error : ${e.message}`);
    process.exit(1);
  }
};

initializeServerAndDB();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoItemQuery = `
    SELECT * 
    FROM todo
    WHERE id = ${todoId} ;`;
  const todoItem = await db.get(todoItemQuery);
  response.send(todoItem);
});

app.post("/todos/", async (request, response) => {
  const todoItem = request.body;
  const { id, todo, priority, status } = todoItem;
  const addTodoQuery = `
    INSERT INTO 
    todo(id,todo,priority,status)
    VALUES(
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    ) ;`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

const statusQuery = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const priorityQuery = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const todoQuery = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { priority, todo, status } = request.body;
  if (statusQuery(request.body)) {
    const putStatusQuery = `
        UPDATE todo
        SET 
        status = '${status}'
        WHERE id = ${todoId} ;`;
    await db.run(putStatusQuery);
    response.send("Status Updated");
  }

  if (priorityQuery(request.body)) {
    const putPriorityQuery = `
        UPDATE todo
        SET 
        priority = '${priority}'
        WHERE id =${todoId} ;`;
    await db.run(putPriorityQuery);
    response.send("Priority Updated");
  }

  if (todoQuery(request.body)) {
    const putTodoQuery = `
        UPDATE todo
        SET 
        todo = '${todo}'
        WHERE id =${todoId} ;`;
    await db.run(putTodoQuery);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const DeleteTodoId = `
     DELETE FROM todo
     WHERE id = ${todoId} ; `;
  await db.run(DeleteTodoId);
  response.send("Todo Deleted");
});
