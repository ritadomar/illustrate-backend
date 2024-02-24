# Project Management Server

## Routes

### Auth Routes

| Method | Route        | Description        |
| ------ | ------------ | ------------------ |
| POST   | /auth/signup | Creates a new user |
| POST   | /auth/login  | Logs the user      |
| GET    | /auth/verify | Verifies the JWT   |

### Artist Routes

| Method | Route            | Description                  |
| ------ | ---------------- | ---------------------------- |
| GET    | /api/artists     | Returns all artists          |
| GET    | /api/artists/:id | Returns the specified artist |
| PUT    | /api/artists/:id | Edits the artist profile     |
| DELETE | /api/artists/:id | Deletes the artist profile   |

### Artwork Routes

| Method | Route            | Description                   |
| ------ | ---------------- | ----------------------------- |
| GET    | /api/artwork     | Returns all artwork           |
| GET    | /api/artwork/:id | Returns the specified artwork |
| POST   | /api/artwork     | Creates a new artwork         |
| PUT    | /api/artwork/:id | Edits the specified artwork   |
| DELETE | /api/artwork/:id | Deletes the specified artwork |

### Commission Routes

| Method | Route               | Description                      |
| ------ | ------------------- | -------------------------------- |
| GET    | /api/commission     | Returns all commissions          |
| GET    | /api/commission/:id | Returns the specified commission |
| POST   | /api/commission     | Creates a new commission         |
| PUT    | /api/commission/:id | Edits the specified commission   |
| DELETE | /api/commission/:id | Deletes the specified commission |

### Request Routes

| Method | Route            | Description                   |
| ------ | ---------------- | ----------------------------- |
| GET    | /api/request     | Returns all requests          |
| GET    | /api/request/:id | Returns the specified request |
| POST   | /api/request     | Creates a new request         |
| PUT    | /api/request/:id | Edits the specified request   |
| DELETE | /api/request/:id | Deletes the specified request |

## Models

### User Model

```js
{
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    name: {
      type: String,
      required: [true, 'Name is required.'],
    },
    username: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
    },
    avatarUrl: String,
    portfolio: String,
    isArtist: Boolean,
    rate: Number,
    artwork: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    commissions: [{ type: Schema.Types.ObjectId, ref: 'Commissions' }],
    requests: [{ type: Schema.Types.ObjectId, ref: 'Requests' }],
  }
```

### Artwork Model

```js
{
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
    },
    description: String,
    artworkUrl: String,
    tags: [{ type: String }],
    time: Number,
    cost: Number,
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    commissions: { type: Schema.Types.ObjectId, ref: 'Commissions' },
  }
}
```

### Commission Model

```js
{
    title: {
      type: String,
      required: [true, 'Title is required.'],
    },
    description: String,
    tags: [{ type: String }],
    exampleArtwork: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    cost: Number,
    requests: [{ type: Schema.Types.ObjectId, ref: 'Requests' }],
  }
```

### Request Model

```js
{
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    buyer: { type: Schema.Types.ObjectId, ref: 'User' },
    commission: { type: Schema.Types.ObjectId, ref: 'Requests' },
    description: {
      type: String,
      required: [
        true,
        'Description is required. Please provide as much useful information about the specs of the project, including size, purpose, media, and deadline',
      ],
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
  }
```
