# turbo-octo-system

Simple Express/Sequelize starter with JWT authentication and Google OAuth.

## Available Endpoints

- `POST /api/v1/auth/register` – create account
- `POST /api/v1/auth/login` – obtain JWT
- `GET  /api/v1/users/:id` – fetch public user profile
- `GET  /api/v1/users/profile/me` – private; requires `Authorization: Bearer <token>`
- OAuth endpoints live under `/api/v1/auth/google` and `/api/v1/auth/google/callback`

Environment is loaded from `.env.<NODE_ENV>`; see `src/config/index.js` for details.
"# psychic-happiness" 
