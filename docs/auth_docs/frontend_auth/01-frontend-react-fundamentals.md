# FoodFlow React Fundamentals & Application Architecture

**Purpose:** A practical reference for the React concepts, TypeScript
terminology, authentication state flow, and application structure used
in this project.

------------------------------------------------------------------------

## 1. What React does in FoodFlow

React is a JavaScript library for building user interfaces from reusable
components.

In FoodFlow, React is responsible for: - Rendering pages such as Home
and Login. - Displaying user-specific information. - Managing UI state
such as loading and authentication status. - Responding to user
interactions. - Navigating between frontend routes. - Communicating with
the backend API.

React does **not** authenticate a user securely by itself. The backend
must verify credentials and enforce permissions.

### The mental model

A React application can be understood as:

1.  **Components** describe what the UI should look like.
2.  **Props** pass data from a parent component to a child.
3.  **State** stores data that can change over time.
4.  **Hooks** let function components use React features.
5.  **Context** shares values across a component subtree.
6.  **Effects** synchronize a component with external systems, such as
    an API.
7.  **Routing** maps URLs to page components.

------------------------------------------------------------------------

## 2. FoodFlow frontend entry point

The entry point is `src/main.tsx`.

Conceptually, the current application is composed like this:

``` text
HTML document
└── <div id="root">
    └── React root
        └── StrictMode
            └── GoogleOAuthProvider
                └── AppProvider
                    └── App
                        └── BrowserRouter
                            ├── Home route
                            ├── Login route
                            └── Toaster
```

### `createRoot`

``` tsx
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
```

-   `createRoot()` creates the React root attached to the HTML element.
-   `.render()` tells React what component tree to render.
-   `document.getElementById("root")` finds the mounting element in
    `index.html`.
-   The TypeScript `!` is a **non-null assertion**. It tells TypeScript
    to treat the result as non-null; it does not perform a runtime
    check.
-   `StrictMode` enables additional development checks. In development,
    some rendering and effect behavior may be repeated to help reveal
    unsafe side effects. It does not mean production requests should be
    duplicated.
-   `GoogleOAuthProvider` makes Google OAuth configuration available to
    its descendants.
-   `AppProvider` makes FoodFlow application context available to its
    descendants.
-   `App` is the main application component.

### Provider composition

A provider should wrap every component that needs its value. Since
`AppProvider` wraps `App`, pages rendered inside `App` can call
`useAppData()`.

If a component is outside the provider tree, `useContext(AppContext)`
will not find that provider.

------------------------------------------------------------------------

## 3. Components and JSX

A **component** is a reusable unit of UI. In React, a function component
returns JSX.

``` tsx
const Login = () => {
  return <h1>Sign in to FoodFlow</h1>;
};

export default Login;
```

-   `Login` is a function component.
-   JSX is syntax that describes UI.
-   React calls the component and renders the returned UI.
-   Component names begin with an uppercase letter.

Components should ideally have clear responsibilities. For example, a
`Login` page handles the login screen, while a reusable `Button`
component handles button presentation and interaction.

------------------------------------------------------------------------

## 4. Props: passing data between components

**Props** (properties) are read-only inputs passed from a parent
component to a child component.

``` tsx
interface WelcomeProps {
  name: string;
}

const Welcome = ({ name }: WelcomeProps) => {
  return <h1>Welcome, {name}</h1>;
};

// Parent
<Welcome name="Dev" />;
```

Important terminology: - **Parent component:** renders another
component. - **Child component:** is rendered by a parent. - **Props:**
the data passed from parent to child. - **Destructuring:** extracting
properties from an object, as in `({ name })`.

Props are read-only. A child should not directly mutate the props it
receives. If the value needs to change, the state owner should update it
and pass the new value down.

### Props vs state

  -----------------------------------------------------------------------
  Props                               State
  ----------------------------------- -----------------------------------
  Passed into a component             Owned by a component or shared
                                      state owner

  Read-only from the child's          Updated using a setter or reducer
  perspective                         

  Changes when the parent supplies    Changes through state updates
  new values                          

  Used for component configuration    Used for data that changes over
  and data flow                       time
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. State and `useState`

**State** is data React remembers between renders. When state is
updated, React schedules a re-render so the UI can reflect the new
value.

FoodFlow's context contains:

``` tsx
const [user, setUser] = useState<User | null>(null);
const [isAuth, setIsAuth] = useState(false);
const [loading, setLoading] = useState(true);
```

Each call returns: 1. The current state value. 2. A setter function used
to request an update.

Examples:

``` tsx
setIsAuth(true);
setUser(data.user);
setLoading(false);
```

A setter can also receive an updater function:

``` tsx
setCount(previousCount => previousCount + 1);
```

This is useful when the next value depends on the previous value.

### State updates and re-rendering

Calling a setter does not directly mutate the existing state variable.
It schedules an update. React renders the component again with the new
state.

Do not mutate objects or arrays already stored in state:

``` tsx
// Avoid: mutates the existing object
user.name = "New name";

// Prefer: create a new object
setUser(previous =>
  previous ? { ...previous, name: "New name" } : null
);
```

### Why `user` and `isAuth` are separate

-   `user` contains profile information, or `null` if no user is loaded.
-   `isAuth` represents the frontend's current authentication status.
-   `loading` represents whether the initial authentication check is
    still in progress.

They serve different UI purposes. They must be kept consistent by the
application, but none of these frontend values is a security boundary.

------------------------------------------------------------------------

## 6. Hooks and the Rules of Hooks

A **Hook** is a React function that lets a function component use React
features.

Examples in FoodFlow: - `useState` - `useEffect` - `useContext` -
`useNavigate` (from React Router) - `useGoogleLogin` (from Google
OAuth) - `useAppData` (a custom FoodFlow Hook)

### Rules of Hooks

1.  Call Hooks at the top level of a function component or custom Hook.
2.  Do not call Hooks inside loops, conditions, or nested ordinary
    functions.
3.  Call Hooks only from React function components or custom Hooks.

These rules let React preserve the correct Hook order between renders.

------------------------------------------------------------------------

## 7. `useEffect`: synchronizing with external systems

`useEffect` is used to synchronize a component with something outside
React, such as an API request, browser event, subscription, or timer.

FoodFlow uses:

``` tsx
useEffect(() => {
  fetchUser();
}, []);
```

The empty dependency array means this effect is intended to run after
the component mounts, rather than after every render. In development,
`StrictMode` may run an additional setup/cleanup cycle to help detect
effect problems.

### Why FoodFlow calls `fetchUser`

React state is held in memory. A browser refresh starts the React
application again, so the in-memory `user` and `isAuth` state return to
their initial values.

The login token may persist in browser storage. `fetchUser()` asks the
backend to validate that credential and return the current profile. If
successful, the app restores its user state.

### Initial loading state

`loading` begins as `true` because the app has not yet completed its
initial authentication check.

A page can use it like this:

``` tsx
const { loading, isAuth } = useAppData();

if (loading) {
  return <p>Checking your session...</p>;
}

return isAuth ? <Dashboard /> : <Login />;
```

This avoids briefly showing the logged-out UI while the profile request
is still pending.

### Effect cleanup and async work

Effects that create subscriptions or browser event listeners should
return a cleanup function. For asynchronous requests, consider
cancellation or ignoring stale results when a component unmounts or a
newer request supersedes an earlier one.

------------------------------------------------------------------------

## 8. Context API: sharing application-wide state

The **Context API** lets a component make a value available to
descendants without passing it manually through every intermediate
component.

FoodFlow uses context for shared authentication-related state.

### `createContext`

``` tsx
const AppContext = createContext<AppContextType | undefined>(undefined);
```

`createContext()` creates a Context object. `AppContext` is not the user
data itself; it is the object React uses to connect a provider with
consumers.

The initial/default value is `undefined`. This allows the custom Hook to
detect when there is no matching provider above the component.

### `AppProviderProps` and `ReactNode`

``` tsx
interface AppProviderProps {
  children: ReactNode;
}
```

-   An **interface** describes the shape of an object in TypeScript.
-   `children` is the content nested between a component's opening and
    closing tags.
-   `ReactNode` is a broad React type for renderable content, including
    elements, strings, numbers, fragments, and arrays of nodes.

Example:

``` tsx
<AppProvider>
  <App />
</AppProvider>
```

Here, `<App />` is passed to `AppProvider` as its `children` prop.

### The provider

``` tsx
export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        setLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
```

The provider: 1. Owns the shared state. 2. Creates the value object. 3.
Makes that value available to descendants. 4. Renders its children
inside the provider boundary.

A component that consumes this context can access the shared values
without receiving them through every parent.

### `useContext`

``` tsx
const context = useContext(AppContext);
```

`useContext()` reads the value from the nearest matching provider above
the component in the React tree.

### Custom Hook: `useAppData`

FoodFlow wraps `useContext()` in a custom Hook:

``` tsx
export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }

  return context;
};
```

Advantages: - Components use one consistent API: `useAppData()`. - The
context implementation is hidden from consumers. - The provider
requirement is checked in one place. - A missing provider causes a clear
error close to the source of the problem.

**Important distinction:**

  -----------------------------------------------------------------------
  Condition                           Meaning
  ----------------------------------- -----------------------------------
  `context === undefined`             No matching `AppProvider` is above
                                      this component

  `context.user === null`             Provider exists, but no user is
                                      currently loaded

  `context.isAuth === false`          Frontend currently considers the
                                      user unauthenticated

  `context.loading === true`          Initial session check is still in
                                      progress
  -----------------------------------------------------------------------

A missing context does **not** mean the user has not logged in. It means
the component is outside the provider tree.

### Consuming context

``` tsx
const Home = () => {
  const { user, isAuth, loading } = useAppData();

  // Render UI based on the shared state
};
```

The object is destructured to read only the values needed by this
component.

------------------------------------------------------------------------

## 9. Props drilling vs Context API

**Props drilling** happens when data is passed through several
intermediate components that do not need the data themselves, only so a
deeply nested component can receive it.

Example:

``` text
App
└── Layout receives user
    └── Header receives user
        └── ProfileMenu receives user
```

Without context, each intermediate component may need to accept and
forward the same prop.

With Context:

``` text
AppProvider
└── App
    └── Layout
        └── Header
            └── ProfileMenu calls useAppData()
```

### When to use which

Use props when: - Data is needed by a direct child or a small component
subtree. - Explicit component dependencies make the code easier to
understand. - The value is local to a particular feature.

Use Context when: - Many components across a subtree need the same
value. - Passing props through many layers becomes noisy. - The value is
genuinely shared, such as current user, theme, or locale.

Do not put every piece of state into Context. Context is a sharing
mechanism, not a replacement for all local state or a complete
state-management strategy. Frequently changing large context values can
cause many consumers to re-render.

------------------------------------------------------------------------

## 10. `React.Dispatch` and `React.SetStateAction`

FoodFlow's context type includes:

``` tsx
setUser: React.Dispatch<React.SetStateAction<User | null>>;
```

This is TypeScript describing the type of a React state setter.

Break it down:

-   `User | null`: state can contain a `User` object or `null`.
-   `React.SetStateAction<T>`: either a value of type `T` or a function
    that receives the previous state and returns a new `T`.
-   `React.Dispatch<A>`: a function that accepts an action of type `A`.

For example:

``` tsx
setUser(data.user);

setUser(previousUser =>
  previousUser ? { ...previousUser, name: "Updated" } : null
);
```

This `Dispatch` is **not Redux dispatch**. It is the type of React's
state setter function.

------------------------------------------------------------------------

## 11. `fetchUser`: restoring the current session

FoodFlow's `fetchUser()` function: 1. Reads the saved token from browser
storage. 2. Sends a request to the backend profile endpoint. 3. Includes
the token in the `Authorization` header. 4. Receives the profile
response. 5. Updates React state. 6. Ends the initial loading state.

Simplified version:

``` tsx
async function fetchUser() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setIsAuth(false);
      return;
    }

    const { data } = await axios.get(
      `${authService}/api/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setUser(data.user);
    setIsAuth(true);
  } catch (error) {
    setUser(null);
    setIsAuth(false);
    // Handle an invalid/expired session appropriately.
  } finally {
    setLoading(false);
  }
}
```

This is a conceptual improvement over the original implementation:
explicitly handle a missing token and reset stale authentication state
on failure. Decide deliberately whether and when to clear an invalid
token.

### API response shape must match frontend expectations

If frontend code reads:

``` tsx
setUser(data.user);
```

the backend should return an object shaped like:

``` json
{
  "user": {
    "_id": "example-id",
    "name": "Example",
    "email": "example@example.com"
  }
}
```

If the backend returns the user object directly, the frontend must
instead read the corresponding direct fields. Frontend and backend
response contracts must agree.

------------------------------------------------------------------------

## 12. Login flow in FoodFlow

The login page uses: - `useState` for the local loading state. -
`useNavigate` to navigate programmatically. - `useGoogleLogin` to
initiate Google OAuth. - Axios to communicate with the backend. -
`localStorage` to store the application's returned token. -
`react-hot-toast` to show feedback.

Simplified flow:

``` text
User clicks Google login
        |
        v
Google OAuth flow
        |
        v
Frontend receives authorization code
        |
        v
POST /api/auth/login
        |
        v
Backend validates/exchanges code
        |
        v
Backend returns FoodFlow token and response
        |
        v
Frontend stores token
        |
        v
Navigate to Home
        |
        v
App profile request restores shared user state
```

### Important terminology

-   **OAuth:** A delegated authorization protocol. In this login flow,
    Google is used as an identity provider.
-   **Authorization code:** A short-lived code exchanged through the
    backend flow for tokens or identity information.
-   **JWT:** A signed token format that can carry claims. A JWT is not
    automatically encrypted.
-   **`useNavigate`:** React Router Hook for programmatic navigation.
-   **`loading`:** UI state indicating an operation is in progress.
-   **`toast`:** Temporary user feedback message.
-   **`finally`:** JavaScript block that runs whether the `try` succeeds
    or throws, useful for resetting loading state.

In the current implementation, the `onError` callback should be a
dedicated error handler rather than reusing the success handler. Prefer
`try/catch/finally` so loading state is reset reliably.

------------------------------------------------------------------------

## 13. React Router: `BrowserRouter`, `Routes`, and `Route`

FoodFlow uses React Router for client-side navigation.

``` tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
  </Routes>
  <Toaster />
</BrowserRouter>
```

-   `BrowserRouter` enables browser-history-based routing.
-   `Routes` selects the matching route.
-   `Route` maps a URL path to a React element.
-   `element={<Home />}` tells the router what to render for that route.
-   `useNavigate()` lets code navigate without a normal anchor click.

Client-side route protection improves navigation and user experience,
but it is not backend authorization. Every protected API endpoint must
still enforce authentication and permissions.

------------------------------------------------------------------------

## 14. `Toaster` and toast notifications

FoodFlow uses `react-hot-toast`.

``` tsx
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

// Render once near the application root:
<Toaster />

// Trigger notifications:
toast.success("Login successful");
toast.error("Problem while logging in");
```

`Toaster` provides the notification rendering area. Calling
`toast.success()` or `toast.error()` asks the library to display a
message.

------------------------------------------------------------------------

## 15. TypeScript concepts used in the React code

### Interfaces

``` tsx
interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}
```

An interface describes the expected shape of an object at compile time.

### Union types

``` tsx
User | null
```

This means the value can be either a `User` or `null`.

### Type annotations

``` tsx
const [isAuth, setIsAuth] = useState<boolean>(false);
```

The annotation explicitly declares the state type. TypeScript can often
infer it, so the generic is not always necessary.

### `ReactNode`

A type representing content React can render.

### `async` / `await`

Used to write asynchronous code in a readable, sequential style:

``` tsx
const response = await axios.get("/api/profile");
```

`await` pauses that async function until the Promise settles. It does
not block the entire browser.

### `try`, `catch`, `finally`

-   `try`: code that may fail.
-   `catch`: handles an error.
-   `finally`: runs whether the operation succeeds or fails.

------------------------------------------------------------------------

## 16. Authentication state is not a security boundary

This is one of the most important architecture lessons from FoodFlow.

Frontend state such as:

``` tsx
setIsAuth(true);
setUser({ ...user, role: "admin" });
```

can be manipulated by the browser user. It can affect what the frontend
displays, but it must never grant backend access.

The correct responsibility split is:

  -----------------------------------------------------------------------
  Layer                               Responsibility
  ----------------------------------- -----------------------------------
  React Context                       Share frontend state

  Frontend route/UI checks            Improve navigation and user
                                      experience

  Backend authentication middleware   Verify token and identify the
                                      caller

  Backend authorization middleware    Check role/permission

  Resource-level authorization        Check ownership and access to the
                                      specific resource

  Database                            Store trusted user and resource
                                      records
  -----------------------------------------------------------------------

### Authentication vs authorization

-   **Authentication:** Who is making this request?
-   **Authorization:** Is this authenticated user allowed to perform
    this action?

Typical HTTP responses:

  -----------------------------------------------------------------------
  Status                              Meaning
  ----------------------------------- -----------------------------------
  401 Unauthorized                    Missing, invalid, or expired
                                      authentication

  403 Forbidden                       Authenticated user lacks permission

  404 Not Found                       Resource does not exist, or an
                                      application deliberately hides its
                                      existence
  -----------------------------------------------------------------------

Do not rely on a frontend role value. Backend authorization should use
trusted identity and permission information.

------------------------------------------------------------------------

## 17. Common React terminology glossary

  -----------------------------------------------------------------------
  Term                                Meaning
  ----------------------------------- -----------------------------------
  Component                           Reusable unit of UI

  JSX                                 Syntax for describing UI in
                                      JavaScript/TypeScript

  Props                               Read-only inputs passed to a
                                      component

  State                               Data React remembers between
                                      renders

  Re-render                           React runs a component again to
                                      calculate updated UI

  Hook                                Function that gives a component
                                      access to React features

  Custom Hook                         A reusable function that uses Hooks

  Context                             Mechanism for sharing a value with
                                      descendants

  Provider                            Component that supplies a Context
                                      value

  Consumer                            Component that reads a Context
                                      value

  Props drilling                      Passing props through intermediate
                                      components

  Destructuring                       Extracting object properties into
                                      variables

  Side effect                         Work that interacts with systems
                                      outside rendering

  Dependency array                    Values that determine when an
                                      effect is re-synchronized

  Mount                               When a component is added to the
                                      rendered tree

  Unmount                             When a component is removed from
                                      the rendered tree

  Controlled input                    Input whose displayed value is
                                      driven by React state

  Conditional rendering               Rendering different UI based on a
                                      condition

  SPA                                 Single-page application; navigation
                                      is handled without full page loads
                                      for each route

  Client-side routing                 Mapping URLs to UI within the
                                      frontend

  API request                         Communication from frontend to
                                      backend

  Promise                             JavaScript object representing an
                                      eventual async result

  Type inference                      TypeScript deriving a type from the
                                      code

  Type safety                         Catching incompatible values and
                                      operations during development/build
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 18. Practical checklist for the next FoodFlow feature

When creating a new frontend feature, ask:

1.  What components should this feature contain?
2.  What data belongs in local state?
3.  Is any data shared by multiple distant components?
4.  Should I pass props, or is Context justified?
5.  What API endpoint does the feature call?
6.  What are the loading, success, empty, and error states?
7.  What TypeScript types describe the request and response?
8.  Does the UI need route navigation?
9.  Is the backend enforcing the actual authorization?
10. Have I tested refresh, invalid sessions, and failed requests?

------------------------------------------------------------------------

## 19. Key takeaways

-   Components build the UI.
-   Props pass data down the component tree.
-   State stores changing data.
-   Hooks provide React functionality.
-   `useEffect` synchronizes with external systems.
-   Context shares values without excessive props drilling.
-   A custom Hook such as `useAppData()` creates a clean and reusable
    access point.
-   `React.Dispatch<React.SetStateAction<T>>` describes a React state
    setter; it is not Redux dispatch.
-   React Router manages frontend navigation.
-   Frontend authentication state is useful for UI, but backend
    verification and authorization protect data and operations.

**Recommended next topic:** Continue with React component composition,
controlled forms, API request lifecycle, and protected frontend routes
as you build the next FoodFlow service.
