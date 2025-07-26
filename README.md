# Countries API

## Project Structure

made this project using **Bun**. It is a all in one javascript tooling, runtime, and it can run typescript directly

### Database

sqlite database used with bun's adapter. created tables for users, apiTokens, sessions, tokenUsage

### http server

used bun's inbuild http server and defined routes. used a cookie based database session authentication for country api calls.
when user send request for country api the header must contained `x-api-key` header. then after validating the api key with database the request will get a response.

### Routes

- `users/register`:registering users.
- `users/login`: login users with valid credentials
- `/users/logout`: logout users by deleting the session
- `/users`: for admin usage
- `/api-key`: for registering an api key only users with valid session can register.
- `/api-key/usage`: check the usage of an api like when it is last used
- `/countries`: users with the correct header with api now can get the countries details as JSON formatted according to the requirements.

To install dependencies:

```bash
bun install
```

no external dependencies used Bun's native APIs
create sqlite.db in the project's root

To run dev server:

```bash
bun run dev
```

To run productions

```bash
bun start
```

or

### using docker

```bash
docker-compose up
```
