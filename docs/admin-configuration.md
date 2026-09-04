# Admin configuration

The LKPB TRACK admin console is intentionally fail-closed. Configure these server-side environment variables before enabling admin access:

- `JWT_SECRET`: a long, random signing secret used for session cookies. Production startup fails when this value is missing.
- `ADMIN_USERNAME`: the admin username. The default value `admin` is fine for internal use.
- `ADMIN_PASSWORD`: the initial admin password. On the first startup, the server hashes this value with scrypt and persists it to the `admin_settings` table. After that, password changes go through the Control Room UI and override the environment value.

The login page does not prefill credentials and does not display demo credentials. Store the values in the deployment secret manager or local `.env` file, never in the repository.
