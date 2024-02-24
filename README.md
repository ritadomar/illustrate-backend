# Project Management Server

## Routes

### Project Routes

| Method | Route             | Description                   |
| ------ | ----------------- | ----------------------------- |
| GET    | /api/projects     | Returns all projects          |
| GET    | /api/projects/:id | Returns the specified project |
| POST   | /api/projects     | Creates a new project         |
| PUT    | /api/projects/:id | Edits the specified project   |
| DELETE | /api/projects/:id | Deletes the specified project |

### Task Routes

| Method | Route      | Description        |
| ------ | ---------- | ------------------ |
| POST   | /api/tasks | Creates a new task |

### Auth Routes

| Method | Route        | Description        |
| ------ | ------------ | ------------------ |
| POST   | /auth/signup | Creates a new user |
| POST   | /auth/login  | Logs the user      |
| GET    | /auth/verify | Verifies the JWT   |

## Models

### Project Model

```js
{
  title: String,
  description: String,
  tasks: [{type: Schema.Types.ObjectId, ref: 'Task'}]
}
```

### Task Model

```js
{
  title: String,
  description: String,
  project: {type: Schema.Types.ObjectId, ref: 'Project'}
}
```

### User Model

```js
{
  name: String
  email: String,
  password: String,
}
```
