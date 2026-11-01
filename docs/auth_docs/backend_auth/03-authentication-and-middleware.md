Absolutely! Let's make this a reusable Authentication & Authorization reference guide that you can revisit whenever you build another backend project—not just FoodFlow.

I'll cover the concepts, code flow, TypeScript types, middleware, JWT, common mistakes, and production-level improvements.



# Authentication Service – Concepts, Implementation & Learning Notes

> A reusable reference guide for implementing authentication and authorization in Node.js, Express, TypeScript, and MongoDB using JWT.

## 1. Overview

Authentication is the process of verifying the identity of a user.

Authorization determines what an authenticated user is allowed to do.

For example, in a food delivery application:

- A customer can place orders.
- A seller can manage restaurant details.
- A rider can manage deliveries.

We implement authentication using:

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JSON Web Token (JWT)

### Authentication flow

1. User sends login details.
2. Backend finds or creates the user in MongoDB.
3. Backend generates a JWT.
4. Client stores the token and sends it with future protected requests.
5. Authentication middleware verifies the token.
6. Middleware identifies the user and attaches the user to the request.
7. The controller executes its business logic.

---

## 2. Project Structure

A typical authentication service can follow this structure:

```
auth/
├── src/
│   ├── config/
│   │   └── db.ts
│   ├── controllers/
│   │   └── auth.ts
│   ├── middlewares/
│   │   ├── isAuth.ts
│   │   └── trycatch.ts
│   ├── model/
│   │   └── User.ts
│   ├── routes/
│   │   └── auth.ts
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

### Responsibility of each folder

| Component   | Responsibility                              |
| ----------- | ------------------------------------------- |
| config      | Database and external service configuration |
| controllers | Business logic                              |
| middlewares | Reusable request-processing logic           |
| model       | MongoDB schema and model                    |
| routes      | API endpoint definitions                    |
| index.ts    | Application entry point                     |

---

## 3. User Model – Defining the User Structure

The user model defines how user information is stored in MongoDB.

Example:

```
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    image: string;
    role: string | null;
}

const schema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const User = mongoose.model<IUser>('User', schema);

export default User;
```

### Important concepts

**Interface**

An interface defines the expected structure of an object.

```
interface IUser {
    name: string;
    email: string;
}
```

**Document**

`Document` is a Mongoose type representing a MongoDB document with Mongoose functionality.

**Schema**

A schema defines the structure, validation rules, and options for MongoDB documents.

**Model**

A model provides methods to interact with the MongoDB collection.

```
User.create()
User.findOne()
User.findById()
User.findByIdAndUpdate()
User.deleteOne()
```

**Important distinction:**

- Interface = TypeScript structure.
- Schema = MongoDB document structure and validation.
- Model = Database interaction API.

For modern Mongoose projects, schema type inference is also a good approach. You don't always need to extend `Document` in your interface.

---

## 4. Controllers – Handling Business Logic

Controllers contain the actual application logic.

For example, a login controller:

```
import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import tryCatch from '../middlewares/trycatch.js';

export const loginUser = tryCatch(async (req, res) => {

    const { email, name, picture } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            email,
            name,
            image: picture
        });
    }

    const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET!,
        { expiresIn: '15d' }
    );

    res.status(200).json({
        message: "User logged in successfully",
        user,
        token
    });
});
```

### What happens here?

1. Extract information from `req.body`.
2. Search for the user using their email.
3. If the user doesn't exist, create a new user.
4. Generate a JWT containing the user's ID.
5. Return the user and token.

### Important JWT concept

Avoid storing the complete MongoDB user document inside the JWT.

Prefer:

```
jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET!,
    { expiresIn: '15d' }
);
```

Why?

- Smaller token.
- Less unnecessary data exposure.
- User information can be fetched fresh from MongoDB.
- Changes to user information don't leave stale data in the token.

JWT payloads are encoded, not encrypted by default. Never put passwords or secrets inside them.

---

## 5. JWT – JSON Web Token

JWT is a compact token format used to transmit claims between parties.

A JWT consists of three parts:

```
HEADER.PAYLOAD.SIGNATURE
```

### Header

Contains information about the token type and signing algorithm.

### Payload

Contains claims such as:

```
{
    "userId": "671abc123",
    "iat": 1793400000,
    "exp": 1794696000
}
```

### Signature

Used to verify that the token was signed using the expected secret or private key.

### Generating a token

```
const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET!,
    { expiresIn: '15d' }
);
```

### Verifying a token

```
const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
);
```

`jwt.verify()` verifies the signature and validates expiration.

It returns the decoded payload if verification succeeds. Otherwise, it throws an error.

---

## 6. Middleware – Understanding the Request Pipeline

Middleware is a function that executes during the request-response cycle.

It can:

- Read request information.
- Modify the request.
- Send a response.
- Pass control to another middleware.
- Forward errors.

Express middleware generally follows this structure:

```
(req, res, next) => {
    // Middleware logic
    next();
}
```

### Understanding the three parameters

| Parameter | Meaning                             |
| --------- | ----------------------------------- |
| req       | Incoming HTTP request               |
| res       | HTTP response sent to the client    |
| next      | Pass control to the next middleware |

### Request (`req`)

Contains incoming request information:

```
req.body
req.params
req.query
req.headers
req.method
req.url
```

### Response (`res`)

Used to send responses:

```
res.status(200).json({ message: "Success" });

res.status(401).json({ message: "Unauthorized" });

res.send("Hello");

res.redirect("/");
```

### Next (`next`)

Moves execution to the next middleware.

```
next();
```

To forward an error:

```
next(error);
```

---

## 7. Higher-Order Function – tryCatch Middleware

Asynchronous controllers often perform database operations.

These operations can fail, so we need error handling.

Instead of writing `try-catch` inside every controller, we can create a reusable wrapper.

### What is a higher-order function?

A higher-order function is a function that:

- Accepts another function as an argument, or
- Returns another function.

Our `tryCatch` wrapper does both.

### Implementation

```
import type { RequestHandler } from 'express';

const tryCatch = (handler: RequestHandler): RequestHandler => {

    return async (req, res, next) => {

        try {
            await handler(req, res, next);

        } catch (error) {
            next(error);
        }

    };
};

export default tryCatch;
```

### Understanding the code

**Step 1: Accept a handler**

```
const tryCatch = (handler: RequestHandler)
```

`handler` is the controller function passed to `tryCatch`.

Example:

```
tryCatch(async (req, res) => {
    const users = await User.find();
    res.json(users);
});
```

**Step 2: Return another function**

```
return async (req, res, next) => {}
```

Express executes the returned function when a request reaches the route.

**Step 3: Execute the original handler**

```
await handler(req, res, next);
```

This executes the controller and waits for asynchronous operations.

**Step 4: Catch errors**

```
catch (error) {
    next(error);
}
```

If the controller throws an error or an awaited operation rejects, the error is forwarded to centralized error-handling middleware.

### Why use tryCatch?

Without it:

```
export const getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};
```

You need to handle asynchronous errors consistently.

With it:

```
export const getUsers = tryCatch(async (req, res) => {
    const users = await User.find();
    res.json(users);
});
```

The wrapper handles rejected promises.

**Note:** Express 5 automatically forwards rejected promises from returned async route handlers. This wrapper is particularly useful for Express 4 and for maintaining a consistent pattern.

---

## 8. AuthenticatedRequest – Extending Express Request

Express already provides a `Request` type.

However, it doesn't know about custom properties such as `req.user`.

We solve this using TypeScript interface extension.

```
import type { Request } from 'express';
import type { IUser } from '../model/User.js';

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
```

### Why do we need it?

Normal Express request:

```
req.body
req.params
req.query
req.headers
```

Our authenticated request additionally supports:

```
req.user
req.user._id
req.user.email
req.user.role
```

### Understanding the syntax

```
interface AuthenticatedRequest extends Request
```

`extends` means we inherit the properties of Express's `Request` interface and add our own.

```
user?: IUser | null;
```

- `?` means the property is optional.
- `IUser` means it contains a Mongoose user document.
- `null` means it can explicitly contain no user.

### Why don't we create AuthenticatedResponse?

Because we haven't added any custom properties to the response object.

Express's existing `Response` type already provides methods such as:

```
res.status()
res.json()
res.send()
```

Use the existing `Response` type unless you have a genuine need to extend it.

---

## 9. isAuth Middleware – Protecting Routes

This is the central part of JWT authentication.

The purpose of `isAuth` is to verify whether the incoming request has a valid authentication token.

### Implementation

```
import type { Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import User from '../model/User.js';
import type { AuthenticatedRequest } from './AuthenticatedRequest.js';

export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                message: 'Unauthorized, Please login!'
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                message: 'Token not found'
            });
            return;
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
            res.status(401).json({
                message: 'Invalid token'
            });
            return;
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({
                message: 'User not found'
            });
            return;
        }

        req.user = user;

        next();

    } catch (error) {

        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError
        ) {
            res.status(401).json({
                message: 'Invalid or expired token'
            });
            return;
        }

        next(error);
    }
};
```

### Understanding the complete process

**Step 1: Read the Authorization header**

```
const authHeader = req.headers.authorization;
```

The client sends the token through the HTTP Authorization header.

Example:

```
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

**Step 2: Validate the Bearer format**

```
if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
}
```

We check whether the header exists and follows the expected format.

**Step 3: Extract the token**

```
const token = authHeader.split(' ')[1];
```

Splitting:

```
Bearer abc123
```

Produces:

```
["Bearer", "abc123"]
```

Index `[1]` contains the actual token.

**Step 4: Verify the JWT**

```
const decoded = jwt.verify(token, secret);
```

This checks whether the token is valid and has not expired.

**Step 5: Extract the user ID**

```
decoded.userId
```

Remember, our login controller signed the token with:

```
{ userId: user._id.toString() }
```

Therefore, the user ID comes from the verified JWT payload.

**Step 6: Fetch the user from MongoDB**

```
const user = await User.findById(decoded.userId);
```

We fetch the latest user document from the database.

**Step 7: Attach the user to the request**

```
req.user = user;
```

Now other middleware and controllers can access the authenticated user.

**Step 8: Continue execution**

```
next();
```

Authentication succeeded. Express continues to the next middleware or controller.

### Why fetch the user from MongoDB again?

Because the JWT only contains the user ID.

Fetching the user allows us to:

- Access the latest role.
- Detect deleted users.
- Use updated account information.
- Avoid trusting outdated user information inside the token.

---

## 10. Understanding `Promise<void>`

Example:

```
export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Logic
};
```

An `async` function always returns a Promise.

`Promise<void>` means the promise resolves without returning a meaningful value.

For example:

```
async function sendResponse(): Promise<void> {
    console.log("Request processed");
}
```

The function performs an operation but doesn't return a useful result.

Our middleware sends a response or calls `next()`, so `Promise<void>` is appropriate.

---

## 11. Optional Chaining – `req.user?._id`

Consider:

```
if (!req.user?._id) {
    return res.status(401).json({
        message: 'Unauthorized'
    });
}
```

### What does `?.` mean?

Optional chaining safely accesses a property when the object might be undefined or null.

Without optional chaining:

```
req.user._id
```

This can throw an error if `req.user` doesn't exist.

With optional chaining:

```
req.user?._id
```

If `req.user` is missing, the expression evaluates to `undefined`.

### What does `!` mean?

Here, `!` is the logical NOT operator.

```
if (!req.user?._id)
```

It checks whether the user ID is missing or falsy.

| Value                   | Result             |
| ----------------------- | ------------------ |
| User ID exists          | Condition is false |
| `req.user` is undefined | Condition is true  |
| `req.user` is null      | Condition is true  |

This is a defensive check before using the authenticated user's ID.

### Why not directly use `user._id`?

Because the user is not automatically available inside every controller.

Our authentication middleware attaches the user to the request:

```
req.user = user;
```

Therefore, the controller accesses:

```
req.user._id
```

---

## 12. Routes – Connecting Middleware and Controllers

Routes define the API endpoints.

Example:

```
import express from 'express';

import {
    loginUser,
    addUserRole,
    myProfile
} from '../controllers/auth.js';

import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/login', loginUser);

router.put('/add/role', isAuth, addUserRole);

router.get('/profile', isAuth, myProfile);

export default router;
```

### Understanding route execution

```
router.put('/add/role', isAuth, addUserRole);
```

The execution order is:

1. Request reaches `/add/role`.
2. `isAuth` executes first.
3. If authentication fails, the middleware sends an error response.
4. If authentication succeeds, it calls `next()`.
5. `addUserRole` executes.

This is why protected routes require the authentication middleware before the controller.

---

## 13. Authentication vs Authorization

These are two different concepts.

### Authentication

Question: Who are you?

Example:

```
isAuth
```

Checks whether the user has a valid authentication token.

### Authorization

Question: What are you allowed to do?

Example:

```
const allowedRoles = ['customer', 'rider', 'seller'] as const;

if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({
        message: 'Access denied'
    });
}
```

In a production system, role-based authorization should be implemented as reusable middleware or service logic.

### HTTP status codes

| Status | Meaning                            |
| ------ | ---------------------------------- |
| 200    | Success                            |
| 201    | Resource created                   |
| 400    | Bad request                        |
| 401    | Authentication required or invalid |
| 403    | Authenticated but not permitted    |
| 404    | Resource not found                 |
| 500    | Internal server error              |

---

## 14. Centralized Error Handling

Instead of sending every unexpected error directly from every controller, use a centralized error handler.

Example:

```
import type { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (
    err,
    req,
    res,
    next
) => {

    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        message: 'Internal server error'
    });
};

export default errorHandler;
```

Register it after your routes:

```
app.use('/api/auth', authRoutes);

app.use(errorHandler);
```

### Why centralized error handling?

- Consistent error responses.
- Less duplicated code.
- Easier debugging.
- Better separation of concerns.
- Avoid exposing internal errors to clients.

---

## 15. Complete Request Flow

### Login

```
Client
  |
  v
POST /api/auth/login
  |
  v
loginUser Controller
  |
  v
Find User in MongoDB
  |
  v
Create User if not found
  |
  v
Generate JWT
  |
  v
Return User + Token
```

### Protected request

```
Client
  |
  | Authorization: Bearer <token>
  v
GET /api/auth/profile
  |
  v
isAuth Middleware
  |
  v
Extract Token
  |
  v
Verify JWT
  |
  v
Get userId from decoded payload
  |
  v
Find User in MongoDB
  |
  v
Attach user to req.user
  |
  v
next()
  |
  v
myProfile Controller
  |
  v
Return User Profile
```

---

## 16. Important Production-Level Improvements

Before using authentication in a real production application, consider the following:

- Validate request bodies using Zod, Joi, or another runtime validation library.
- Validate environment variables at application startup.
- Never expose JWT secrets or passwords.
- Avoid storing sensitive information in JWT payloads.
- Use short-lived access tokens and a carefully designed refresh-token strategy where appropriate.
- Use HTTPS in production.
- Configure secure token storage and cookie settings according to your client architecture.
- Handle expired, malformed, and invalid tokens correctly.
- Add rate limiting to login and other sensitive endpoints.
- Handle MongoDB duplicate-key errors.
- Add account status checks, such as disabled or suspended users.
- Use role-based authorization for protected operations.
- Never trust client-supplied user IDs for operations that should use the authenticated identity.

---

## 17. Quick Revision – Concepts to Remember

| Concept                | Remember                                          |
| ---------------------- | ------------------------------------------------- |
| Interface              | Defines object structure in TypeScript            |
| Schema                 | Defines MongoDB document structure and validation |
| Model                  | Provides database operations                      |
| Controller             | Contains business logic                           |
| Router                 | Maps endpoints to middleware and controllers      |
| Middleware             | Executes during the request-response cycle        |
| `Request`              | Incoming HTTP request                             |
| `Response`             | Outgoing HTTP response                            |
| `NextFunction`         | Passes execution to the next middleware           |
| `RequestHandler`       | Type for an Express request handler               |
| Higher-order function  | Accepts or returns another function               |
| `tryCatch`             | Reusable asynchronous error wrapper               |
| `AuthenticatedRequest` | Express Request extended with `user`              |
| `isAuth`               | Verifies the JWT and identifies the user          |
| `req.user`             | Authenticated user attached by middleware         |
| `next()`               | Continues the middleware pipeline                 |
| `Promise<void>`        | Promise that resolves without a meaningful value  |
| `?.`                   | Optional chaining                                 |
| `!`                    | Logical NOT operator                              |
| JWT                    | Signed token containing claims                    |
| Authentication         | Verifying identity                                |
| Authorization          | Checking permissions                              |

---

## 18. SDE Interview Questions

Use these questions to test whether you understand the implementation.

1. What is middleware in Express.js?
2. What is the difference between middleware and controllers?
3. Why do we use `next()`?
4. What happens if middleware doesn't call `next()` or send a response?
5. What is a higher-order function?
6. Why do we use a `tryCatch` wrapper?
7. What is the difference between `Request` and `AuthenticatedRequest`?
8. Why do we attach the authenticated user to `req.user`?
9. What is the difference between `req.body`, `req.params`, and `req.query`?
10. How does JWT authentication work?
11. What is the difference between `jwt.sign()` and `jwt.verify()`?
12. What are the three parts of a JWT?
13. Is JWT encrypted by default?
14. Why should we avoid storing the entire user document in a JWT?
15. What is the difference between authentication and authorization?
16. What is the difference between HTTP 401 and 403?
17. Why do we use `Promise<void>` in asynchronous middleware?
18. What is optional chaining?
19. Why should we fetch the user from MongoDB after verifying the JWT?
20. How would you implement role-based access control?

---

## Final Mental Model

Remember these five responsibilities:

1. **Model:** What does the user look like in the database?
2. **Controller:** What should happen when the user makes a request?
3. **Router:** Which controller should handle the request?
4. **tryCatch:** How should asynchronous errors be handled?
5. **isAuth:** Is the requester authenticated, and who is the user?

Once you understand these responsibilities, you can reuse the same architecture in e-commerce applications, SaaS platforms, banking applications, food delivery systems, and other backend projects.

**The goal is not to memorize the code. Understand why each component exists and how data moves through the request pipeline.**

