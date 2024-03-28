# Illlu

## About the project

Illlu is a website for illustrators and art lovers. Illustrators often struggle with pricing their work and pricing it fairly. That's where Illlu helps.
When you register as an illustrator, you'll need to submit your hourly rate. If you're unsure, we suggest a minimum hourly rate to help! Every time you upload an illustration, you'll need to submit the number of hours you spent on that illustration, including any time spent discussing details with your client if it applies. With this information, Illlu can calculate the cost for every single artwork you submit.
On Illlu, you can bundle different illustrations into commission packs so art lovers can find your work and hire you. Every commission price is calculated by creating an average of the prices each of its artworks costs, making it easy to ask for a fair price.
Finally, no matter if you're an illustrator or an art lover, you can just use Illlu to explore different illustrations and commissions, the perfect place for inspiration!

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

| Method | Route                   | Description                   |
| ------ | ----------------------- | ----------------------------- |
| GET    | /api/profiles/:username | Returns the specified profile |
| PUT    | /api/profiles/:username | Edits the profile             |
| DELETE | /api/profiles/:username | Deletes the artist profile    |

### Rating Routes

| Method | Route            | Description                  |
| ------ | ---------------- | ---------------------------- |
| GET    | /api/ratings/:id | Returns the specified rating |
| POST   | /api/ratings     | Creates a new rating         |

### Request Routes

| Method | Route             | Description                   |
| ------ | ----------------- | ----------------------------- |
| GET    | /api/requests     | Returns all requests          |
| GET    | /api/requests/:id | Returns the specified request |
| POST   | /api/requests     | Creates a new request         |
| PUT    | /api/requests/:id | Edits the specified request   |
| DELETE | /api/requests/:id | Deletes the specified request |

### Tag Routes

| Method | Route              | Description               |
| ------ | ------------------ | ------------------------- |
| GET    | /api/tags          | Returns all tags          |
| GET    | /api/tags/:tagName | Returns the specified tag |

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
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
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
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    exampleArtwork: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    cost: Number,
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    requests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
  }
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
      enum: ['pending', 'approved', 'rejected', 'canceled', 'completed'],
      default: 'pending',
    },
  },
```

### Tag Model

```js
{
    tagName: { type: String, required: true, lowercase: true },
    artwork: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    commissions: [{ type: Schema.Types.ObjectId, ref: 'Commission' }],
  }
```

## Packages

- Cloudinary
- CORS
- Express
- Mongoose
- Morgan
- Multer
- Nodemon

## Links

- [Client repo](https://github.com/ritadomar/illustrate)
- [Deployed website](https://illlu.netlify.app/)
