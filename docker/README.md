# How to Deploy Chatbot-UI Locally with Docker Compose

This guide walks you through setting up Chatbot-UI locally using Docker Compose and a self-hosted Supabase instance. It covers securing your environment, configuring environment variables, running services, and applying database migrations, including optional adjustments to the migration SQL file.



---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Securing Your Services](#securing-your-services)
3. [Environment Variable Configuration](#environment-variable-configuration)
4. [Optional: Update Migration SQL File](#optional-update-migration-sql-file)
5. [Deployment Steps](#deployment-steps)
6. [Accessing Chatbot-UI](#accessing-chatbot-ui)
7. [Notes](#notes)

---

## Prerequisites

- **Docker** and **Docker Compose** installed on your machine.
- Basic knowledge of environment variables and server configuration.

---

## Securing Your Services

> **Important:**  
> Never use default or sample secrets in production. Always generate your own secure credentials.

For more details, refer to the [official Supabase Docker guide](https://supabase.com/docs/guides/self-hosting/docker).

Follow these steps to secure your setup:

- **JWT Secret:**  
  - Generate a secure, random 40-character secret.  
  - Store this secret securely—do not share or commit it to version control.
- **API Keys:**  
  - Use your JWT secret to generate new anon and service API keys.
  - Update the following in your `.env` file:
    - `ANON_KEY`
    - `SERVICE_ROLE_KEY`
- **Other Secrets:**  
  - Edit your `.env` and set:
    - `POSTGRES_PASSWORD` (Postgres role password)
    - `JWT_SECRET` (used by PostgREST, GoTrue, etc.)
    - `SITE_URL` (your site’s base URL)
    - `SMTP_*` (mail server credentials)
    - `POOLER_TENANT_ID` (Supavisor pooler tenant ID)
- **Dashboard Authentication:**  
  - Change the default dashboard username and password in `.env`:
    - `DASHBOARD_USERNAME`
    - `DASHBOARD_PASSWORD`

**After updating any secrets, always restart all services to apply changes.**

For more information, see [Securing Your Services](https://supabase.com/docs/guides/self-hosting/docker#securing-your-services).

---

## Environment Variable Configuration

1. **Copy the Environment Variable Template**

   ```bash
   cd docker
   cp .env.example .env
   cp ../.env.example ../.env.docker
   ```

2. **Edit the `.env` File**

   - Replace all placeholder values with your own secure secrets and configuration as described above.

3. **Configure Chatbot-UI Environment Variables**

   Edit your Chatbot-UI environment variables file ( `../.env.docker`) as follows：

   ```
   NEXT_PUBLIC_SUPABASE_PUBLIC_URL=http://<your-server-ip>:8000
   NEXT_PUBLIC_SUPABASE_SERVER_URL=http://kong:8000
   ```

   > Replace `<your-server-ip>` with your actual server’s IP address or domain name.

   **Example:**

   ```
   NEXT_PUBLIC_SUPABASE_PUBLIC_URL=http://192.168.1.100:8000
   NEXT_PUBLIC_SUPABASE_SERVER_URL=http://kong:8000
   ```

---

## Optional: Update Migration SQL File

Before running the database migrations, you may need to update the following lines in `supabase/migrations/20240108234540_setup.sql` to match your deployment:

```sql
  project_url TEXT := 'http://kong:8000';
  service_role_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3NDQ5MDU2MDAsCiAgImV4cCI6IDE5MDI2NzIwMDAKfQ.RB5XU7Y4BzKf0Usb-8oBnXqbT86Gqj77TNCBf3EH-_U';
```

**Modify as follows:**

```sql
  project_url TEXT := 'http://kong:8000';
  service_role_key TEXT := '<your-actual-service-role-key>';
```

- Replace `<your-server-ip>` with your actual server IP or domain name.
- Replace `<your-actual-service-role-key>` with the value set in your `.env` (`SERVICE_ROLE_KEY`).

**Note:**  
Make sure these values are consistent with your environment variables and deployment configuration to avoid permission or connection issues.

---

## Deployment Steps

1. **Ensure all environment variables are configured as described above.**

2. **Start Supabase and Chatbot-UI Services**

   ```bash
   docker compose up -d
   ```

3. **Run Database Migrations for Chatbot-UI**

   ```bash
   docker exec -it supabase-db /supabase/execute_migrations.sh
   ```

---

## Accessing Chatbot-UI

Open your browser and navigate to:

```
http://<your-server-ip>:3000
```

For example:

```
http://192.168.1.100:3000
```

Chatbot-UI should now be running locally.

---

## Notes

- Always keep your secrets safe and never expose them publicly.
- For production deployments, further hardening and security measures are recommended.
- If you change any secrets or configuration, always restart all relevant services.
- Refer to the [Supabase documentation](https://supabase.com/docs) for advanced configuration and troubleshooting.
