# Module 4 · Week 2 · Day 1 — Authentication

Completed Express, EJS and Passport Local classroom exercise.

## Run

```sh
npm install
npm start
```

Open http://localhost:3000.

| Username | Password |
| --- | --- |
| westcliff | secret |
| westcliffclass | birthday |

The welcome page is public. `/home` redirects anonymous visitors to `/login`.
Valid credentials establish a session; invalid credentials show an error. Logout
ends the session and returns to the welcome page.

## Verify

```sh
npm test
```

Tests cover both users, wrong/unknown/missing credentials, session persistence,
protected Home access, and logout. Passport's current callback-based logout API
is used. Demo credentials and the in-memory session store are for this classroom
exercise only. A production app needs hashed passwords and a persistent store.

Reference: https://www.passportjs.org/concepts/authentication/sessions/
