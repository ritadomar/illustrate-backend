# Project Management Server

## Routes

### Auth Routes

| Method | Route        | Description        |
| ------ | ------------ | ------------------ |
| POST   | /auth/signup | Creates a new user |
| POST   | /auth/login  | Logs the user      |
| GET    | /auth/verify | Verifies the JWT   |

### Artist Routes

| Method | Route        | Description         |
| ------ | ------------ | ------------------- |
| GET    | /api/artists | Returns all artists |

### Artwork Routes

| Method | Route             | Description                   |
| ------ | ----------------- | ----------------------------- |
| GET    | /api/artworks     | Returns all artwork           |
| GET    | /api/artworks/:id | Returns the specified artwork |
| POST   | /api/artworks     | Creates a new artwork         |
| PUT    | /api/artworks/:id | Edits the specified artwork   |
| DELETE | /api/artworks/:id | Deletes the specified artwork |

### Commission Routes

| Method | Route                | Description                      |
| ------ | -------------------- | -------------------------------- |
| GET    | /api/commissions     | Returns all commissions          |
| GET    | /api/commissions/:id | Returns the specified commission |
| POST   | /api/commissions     | Creates a new commission         |
| PUT    | /api/commissions/:id | Edits the specified commission   |
| DELETE | /api/commissions/:id | Deletes the specified commission |

### Profile Routes

| Method | Route             | Description                   |
| ------ | ----------------- | ----------------------------- |
| GET    | /api/profiles/:id | Returns the specified profile |
| PUT    | /api/profiles/:id | Edits the profile             |
| DELETE | /api/profiles/:id | Deletes the artist profile    |

### Request Routes

| Method | Route             | Description                   |
| ------ | ----------------- | ----------------------------- |
| GET    | /api/requests     | Returns all requests          |
| GET    | /api/requests/:id | Returns the specified request |
| POST   | /api/requests     | Creates a new request         |
| PUT    | /api/requests/:id | Edits the specified request   |
| DELETE | /api/requests/:id | Deletes the specified request |

### Rating Routes

| Method | Route            | Description                  |
| ------ | ---------------- | ---------------------------- |
| GET    | /api/ratings/:id | Returns the specified rating |
| POST   | /api/ratings     | Creates a new rating         |

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
    isArtist: { type: Boolean, default: false },
    rate: Number,
    artwork: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    commissions: [{ type: Schema.Types.ObjectId, ref: 'Commission' }],
    requests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
    ratings: [{ type: Schema.Types.ObjectId, ref: 'Rating' }],
    avgRating: { type: Number, default: 0 },
  }
```

### Artwork Model

```js
{
    title: {
      type: String,
      required: [true, 'Title is required.'],
    },
    description: String,
    artworkUrl: {
      type: String,
      required: [true, 'Image is required'],
    },
    tags: [{ type: String }],
    time: Number,
    cost: Number,
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    commissions: [{ type: Schema.Types.ObjectId, ref: 'Commission' }],
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
    cost: Number,
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    requests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
  }
```

### Request Model

```js
{
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    buyer: { type: Schema.Types.ObjectId, ref: 'User' },
    commission: { type: Schema.Types.ObjectId, ref: 'Commission' },
    description: {
      type: String,
      required: [
        true,
        'Description is required. Please provide as much useful information about the specs of the project, including size, purpose, media, and deadline',
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
```

### Rating Model

```js
{
    giver: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: {
      type: Number,
      max: 5,
      required: [true, 'You need to submit a rating'],
    },
    comment: String,
  }
```
