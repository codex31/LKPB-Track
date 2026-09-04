# Admin configuration

The LKPB TRACK admin console is intentionally fail-closed. Configure these server-side environment variables before enabling admin access:

- `JWT_SECRET`: a long, random signing secret used for session cookies. Production startup fails when this value is missing.
- `ADMIN_USERNAME`: the admin username.
- `ADMIN_PASSWORD`: a strong admin password. Do not commit it or expose it in client code.

The login page does not prefill credentials and does not display demo credentials. Store the values in the deployment secret manager or local `.env` file, never in the repository.
