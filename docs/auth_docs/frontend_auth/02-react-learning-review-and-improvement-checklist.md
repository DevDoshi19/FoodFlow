# FoodFlow React Learning Review --- Mistakes, Gaps & Next Concepts

**Purpose:** Track misunderstandings, important distinctions,
implementation improvements, and concepts to learn as the frontend
grows.

------------------------------------------------------------------------

## 1. Why this document exists

This is not a list of failures. It records the places where a concept
was initially understood only partially, so it can be revised before the
next feature or service is built.

The most important lesson so far:

> Frontend state describes what the UI currently believes. The backend
> must independently decide whether a request is authenticated and
> authorized.

------------------------------------------------------------------------

## 2. Concepts that needed correction

### 2.1 Context missing vs user not logged in

**Initial understanding:** If `useAppData()` does not receive data,
perhaps the user has not logged in or their information was not stored.

**Correct understanding:** These are separate situations.

  -----------------------------------------------------------------------
  Check                               What it actually means
  ----------------------------------- -----------------------------------
  `context === undefined`             The component is not under the
                                      matching `AppProvider`

  `context.user === null`             The provider exists, but no user
                                      profile is currently loaded

  `context.isAuth === false`          The frontend currently considers
                                      the user unauthenticated

  `context.loading === true`          The initial session check is still
                                      in progress
  -----------------------------------------------------------------------

**Remember:** `useAppData()` checks provider availability, not login
status.

### 2.2 Context is not a database

**Potential misunderstanding:** We store all application data in
Context.

**Correct understanding:** Context stores or exposes values in React's
in-memory component tree. It is not persistent storage and it is not a
database.

-   State disappears when the page is fully refreshed, unless restored
    from another source.
-   The backend database remains the persistent source of application
    records.
-   Context is best for genuinely shared frontend state, such as the
    current user or theme.
-   Feature-specific state should usually remain near the feature that
    uses it.

Do not place every API response and every form field into one global
Context.

### 2.3 `setUser` and `setIsAuth` do not secure the application

**Potential misunderstanding:** If the frontend has `isAuth` and `user`,
the application can trust those values.

**Correct understanding:** Browser-side state can be manipulated by the
person using the browser. It is suitable for UI decisions, not security
enforcement.

The backend must verify the request's credential and enforce permissions
on every protected endpoint.

### 2.4 Authentication vs authorization

These are related but different checks:

-   **Authentication:** Who is making the request?
-   **Authorization:** Is that user allowed to perform this action?

Typical responses:

-   `401`: missing, invalid, or expired authentication.
-   `403`: authenticated caller does not have permission.

Do not return 401 simply because an authenticated user has the wrong
role.

### 2.5 Role check vs resource ownership check

A role check alone is not enough.

Example: two restaurant owners both have the `restaurant_owner` role.
Owner A must not access Owner B's orders merely because both have the
same role.

The backend must check: 1. The caller's identity. 2. Their role or
permission. 3. Whether they have access to the specific
restaurant/order/resource.

This is resource-level authorization and helps prevent **Broken Object
Level Authorization (BOLA)**.

### 2.6 `Dispatch` is not necessarily Redux dispatch

In FoodFlow's type:

``` tsx
React.Dispatch<React.SetStateAction<User | null>>
```

`Dispatch` describes the function type of a React state setter. It does
not mean FoodFlow is using Redux.

------------------------------------------------------------------------

## 3. Mistakes and improvements to watch for in the current code

These are code-review points based on the FoodFlow code discussed so
far. They are not all confirmed production vulnerabilities; verify them
against the current branch before changing code.

### 3.1 `fetchUser()` should handle a missing token

If there is no token, do not send a request with:

``` http
Authorization: Bearer null
```

Check first:

``` tsx
const token = localStorage.getItem("token");

if (!token) {
  setUser(null);
  setIsAuth(false);
  return;
}
```

Make sure `setLoading(false)` still runs, typically through `finally`.

### 3.2 Reset stale authentication state on profile failure

If the profile request fails because the token is invalid or expired,
the UI should not continue showing an old authenticated user.

A robust pattern should reset the frontend state:

``` tsx
catch (error) {
  setUser(null);
  setIsAuth(false);
}
```

Decide whether to clear the stored token based on the error. A 401
normally indicates the session credential is no longer valid. A
temporary network error does not necessarily mean the token is invalid,
so avoid treating every failure as proof of logout.

### 3.3 Make loading state reliable in login

The login code currently sets loading to false in both success and error
paths. A `finally` block is easier to maintain:

``` tsx
try {
  // Perform login request
} catch (error) {
  // Display error
} finally {
  setLoading(false);
}
```

### 3.4 Do not use the success handler as the OAuth error handler

If `useGoogleLogin` has an `onError` callback, give it a dedicated error
handler. An error result is not the same shape or meaning as a
successful authorization-code result.

### 3.5 Keep frontend and backend response contracts aligned

If the frontend reads:

``` tsx
setUser(data.user);
```

the backend must return a response with a `user` property. If the
backend returns the user object directly, the frontend must read the
direct object instead.

Write down request and response shapes so both sides agree.

### 3.6 Do not assume `useEffect` blocks the first render

`useEffect` runs after rendering. The API request is asynchronous.

Use `loading` to show a session-checking state until the request
finishes. This avoids rendering a misleading logged-out screen while the
app is still checking the session.

### 3.7 Understand React Strict Mode

In development, `StrictMode` can re-run certain render/effect behavior
to help reveal unsafe side effects. Do not assume an effect with `[]`
can never be invoked more than once during development.

Make effects resilient, and avoid non-idempotent operations that should
happen only once without appropriate safeguards.

### 3.8 Check import filename casing

The code discussed imported:

``` tsx
import { AppProvider } from "./context/appContext";
```

while the repository file was named `AppContext.tsx`.

Windows filesystems are often case-insensitive, while Linux deployment
environments are commonly case-sensitive. Make import casing exactly
match the filename.

### 3.9 Keep context focused

The current context includes authentication-related state. Avoid turning
it into a global container for every feature.

A large context value can cause many consumers to re-render when it
changes. Split contexts or use feature-local state when the application
grows and profiling shows a need.

------------------------------------------------------------------------

## 4. Security rules to remember while building FoodFlow

### Rule 1 --- Never trust the frontend

A user can modify: - React state. - Browser storage. - JavaScript
execution. - URL parameters. - Request bodies and headers.

Treat all client-supplied data as untrusted.

### Rule 2 --- Verify JWTs on the backend

Use signature verification and validate expiry and relevant claims. Do
not rely on simply decoding a JWT.

### Rule 3 --- Build an authentication middleware

The middleware should: 1. Read the expected credential. 2. Reject
missing credentials. 3. Verify signature and expiry. 4. Identify the
user. 5. Check account status where appropriate. 6. Attach trusted
identity to the request. 7. Continue to the next middleware.

### Rule 4 --- Build authorization checks

Check roles/permissions on the backend. Never use a role supplied in a
request body or a mutable frontend object as the authority.

### Rule 5 --- Check ownership of each resource

For restaurant orders, addresses, menus, and other user-owned data,
check whether the authenticated user is permitted to access that exact
record.

### Rule 6 --- Treat CORS as a browser policy, not authentication

CORS controls which browser origins may read responses under browser
enforcement. It does not stop arbitrary clients from sending requests.
Backend authentication and authorization are still required.

### Rule 7 --- Store secrets only on the server

Never expose JWT signing secrets, OAuth client secrets, database
credentials, or private API keys in frontend bundles or public
repositories.

### Rule 8 --- Understand token storage trade-offs

`localStorage` is readable by JavaScript, so an XSS vulnerability can
expose stored tokens.

HttpOnly cookies prevent JavaScript from reading the cookie, but
cookie-based authentication needs suitable `Secure`, `SameSite`, and
CSRF protections. Neither approach removes the need for XSS prevention.

------------------------------------------------------------------------

## 5. React concepts to learn next

Use this as a learning backlog. Learn concepts as they become relevant
to the next FoodFlow feature rather than trying to master every topic at
once.

### Core React

-   [ ] Component composition
-   [ ] Parent-child component relationships
-   [ ] Props and prop typing
-   [ ] Props drilling and when it becomes a problem
-   [ ] Local state vs shared state
-   [ ] State immutability
-   [ ] Conditional rendering
-   [ ] Rendering lists and stable `key` props
-   [ ] Controlled and uncontrolled inputs
-   [ ] Form handling and validation
-   [ ] Lifting state up
-   [ ] Component lifecycle concepts: mount, update, unmount

### Hooks

-   [ ] `useState`
-   [ ] `useEffect` and dependency arrays
-   [ ] Effect cleanup
-   [ ] `useContext`
-   [ ] Custom Hooks
-   [ ] `useRef`
-   [ ] `useMemo`
-   [ ] `useCallback`
-   [ ] Rules of Hooks

Do not use `useMemo` or `useCallback` everywhere automatically.
Understand the performance problem first.

### Routing and application structure

-   [ ] `BrowserRouter`, `Routes`, `Route`
-   [ ] `useNavigate`
-   [ ] URL parameters and query parameters
-   [ ] Nested routes
-   [ ] Layout routes
-   [ ] Protected frontend routes
-   [ ] Error and not-found routes
-   [ ] Code splitting and lazy loading

Remember: protected frontend routes improve UX. They do not replace
backend authorization.

### API and asynchronous UI

-   [ ] Axios request and response handling
-   [ ] Request/response TypeScript types
-   [ ] Loading, success, empty, and error states
-   [ ] Centralized API client
-   [ ] Interceptors
-   [ ] Cancellation and stale request handling
-   [ ] Pagination and filtering
-   [ ] Optimistic UI updates
-   [ ] Server-state libraries such as TanStack Query when the app needs
    them

### TypeScript for React

-   [ ] Interfaces and type aliases
-   [ ] Union types
-   [ ] Optional properties
-   [ ] Generics
-   [ ] `ReactNode`
-   [ ] Event types
-   [ ] Component prop types
-   [ ] API response types
-   [ ] Type narrowing
-   [ ] Avoiding unnecessary `any`

### Testing and quality

-   [ ] React Testing Library
-   [ ] Component tests
-   [ ] User interaction tests
-   [ ] API integration tests
-   [ ] Accessibility basics
-   [ ] Error boundaries
-   [ ] ESLint and formatting
-   [ ] Browser developer tools

------------------------------------------------------------------------

## 6. Technical vocabulary for interviews and code reviews

  -----------------------------------------------------------------------
  Term                                Interview-ready meaning
  ----------------------------------- -----------------------------------
  Component composition               Building complex UI by combining
                                      smaller components

  Unidirectional data flow            Data generally flows from parent to
                                      child through props

  Props drilling                      Passing props through intermediate
                                      components to reach a deeper
                                      descendant

  State management                    Organizing changing application
                                      data and its updates

  State setter                        Function returned by `useState`
                                      that requests a state update

  Reconciliation                      React's process of comparing
                                      rendered element descriptions and
                                      updating the UI

  Virtual DOM                         Common term for React's in-memory
                                      element representation; React uses
                                      reconciliation to determine updates

  Context propagation                 Making a provider's value available
                                      to descendant consumers

  Custom Hook                         A reusable function that composes
                                      React Hooks

  Side effect                         Synchronization or interaction with
                                      something outside the render
                                      calculation

  Dependency array                    Declares reactive values an effect
                                      or memoized callback depends on

  Cleanup function                    Function returned from an effect to
                                      undo subscriptions or other setup

  Controlled component                Form element whose value is driven
                                      by React state

  Lifting state up                    Moving shared state to a common
                                      parent

  Derived state                       A value calculated from existing
                                      props or state rather than stored
                                      independently

  Client-side routing                 Selecting frontend UI based on the
                                      current URL

  Authentication                      Verifying the identity of the
                                      caller

  Authorization                       Determining what an authenticated
                                      caller may do

  RBAC                                Role-Based Access Control:
                                      permissions are associated with
                                      roles

  BOLA                                Broken Object Level Authorization:
                                      failure to check access to a
                                      specific object/resource

  JWT                                 A token format carrying claims,
                                      commonly signed so a server can
                                      verify integrity

  XSS                                 Injection of malicious script into
                                      a page viewed by another user

  CSRF                                Tricking a browser into making an
                                      unwanted authenticated request

  CORS                                Browser-enforced policy controlling
                                      cross-origin access to responses
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 7. A repeatable checklist after every FoodFlow feature

For each new feature or service, add a short note answering:

### Feature overview

-   What problem does this feature solve?
-   Which page/components are involved?
-   Which backend endpoints are called?

### React design

-   What are the components?
-   What are their props?
-   What state is local?
-   What state is shared?
-   Is Context really needed?
-   Which Hooks are used, and why?

### API contract

-   What request is sent?
-   What response is expected?
-   What errors can occur?
-   What are the loading, empty, success, and error UI states?

### Security

-   Does the backend authenticate the request?
-   Does it authorize the action?
-   Does it verify resource ownership?
-   Is all client input validated?

### Testing

-   Does the happy path work?
-   What happens on refresh?
-   What happens with an expired session?
-   What happens when the network fails?
-   What happens when the user lacks permission?
-   What happens when the resource does not exist?

------------------------------------------------------------------------

## 8. Short revision questions

Try answering these without looking at the first document:

1.  What is the difference between props and state?
2.  What problem does Context solve?
3.  What is props drilling?
4.  What does `useAppData()` check?
5.  What is the difference between `context === undefined` and
    `context.user === null`?
6.  Why does FoodFlow call `fetchUser()` after the application mounts?
7.  Why does `useEffect` not block the first render?
8.  What does `React.Dispatch<React.SetStateAction<T>>` describe?
9.  Why can frontend `isAuth` not protect an API endpoint?
10. What is the difference between authentication and authorization?
11. Why is RBAC alone insufficient to protect every restaurant's orders?
12. What is BOLA, and how can resource ownership checks prevent it?

------------------------------------------------------------------------

## 9. Current learning status

### Understood and discussed

-   [x] Components and JSX basics
-   [x] `useState`
-   [x] `useEffect` and initial session restoration
-   [x] Context API and Provider
-   [x] `createContext` and `useContext`
-   [x] Custom Hook `useAppData`
-   [x] Props drilling vs Context
-   [x] `ReactNode`
-   [x] `React.Dispatch` and `React.SetStateAction`
-   [x] React Router basics
-   [x] `useNavigate`
-   [x] Login flow at a high level
-   [x] Frontend state vs backend security
-   [x] Authentication vs authorization
-   [x] RBAC at a conceptual level

### Needs more hands-on practice

-   [ ] Controlled forms and validation
-   [ ] Reusable component props
-   [ ] Effect cleanup and request cancellation
-   [ ] Protected frontend routes
-   [ ] API client/interceptors
-   [ ] Error and loading state design
-   [ ] Resource-level authorization and BOLA prevention
-   [ ] React component testing

------------------------------------------------------------------------

## 10. Final principle

Build the UI with React, organize shared state deliberately, type
component and API contracts with TypeScript, and treat the backend as
the authority for identity and permissions.

The goal is not merely to make FoodFlow work. The goal is to understand
why each part exists, what responsibility it owns, and how it behaves
when something fails.
