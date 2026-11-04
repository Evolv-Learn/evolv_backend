# Render Deployment Guide — EvolvLearn Backend

## Architecture
- **Backend (Django):** Render Web Service
- **Database (PostgreSQL):** Render Managed Database
- **Cron Job:** Render Cron Job (instalment deadline enforcement)
- **Frontend (Next.js):** Vercel — does NOT run Django commands

---

## First-Time Deployment Steps

### Step 1 — Connect Repository to Render

1. Go to [render.com](https://render.com) → New → Blueprint
2. Connect your GitHub repository
3. Render will detect `render.yaml` and provision all services automatically:
   - `evolvlearn-backend` (Web Service)
   - `enforce-instalment-deadlines` (Cron Job)
   - `evolvlearn-db` (PostgreSQL)

---

### Step 2 — Set Secret Environment Variables

These are marked `sync: false` in `render.yaml` — you must set them manually
in the Render dashboard under each service's **Environment** tab:

| Variable | Where to get it |
|---|---|
| `DJANGO_SECRET_KEY` | Run: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DJANGO_ALLOWED_HOSTS` | Your Render URL e.g. `evolvlearn-backend.onrender.com,evolvlearn.org` |
| `FRONTEND_ORIGINS` | Your Vercel URL e.g. `https://evolvlearn.org,https://www.evolvlearn.org` |
| `FRONTEND_URL` | `https://evolvlearn.org` |
| `EMAIL_HOST_USER` | `evolvngo@gmail.com` |
| `EMAIL_HOST_PASSWORD` | Your Gmail App Password (not your Gmail password) |
| `PAYSTACK_SECRET_KEY` | From Paystack dashboard → Settings → API Keys |

> Set the same secret variables on BOTH the web service AND the cron job.

---

### Step 3 — Apply Migrations

Migrations run automatically on every deploy via `startup.sh`:

```bash
python manage.py migrate --no-input
python manage.py collectstatic --no-input
```

To run manually (e.g. first deploy or after a schema change):

1. Go to Render dashboard → `evolvlearn-backend` → **Shell**
2. Run:
```bash
python manage.py migrate
python manage.py createsuperuser  # First time only
```

---

### Step 4 — Verify the Cron Job

1. Go to Render dashboard → `enforce-instalment-deadlines`
2. Confirm schedule shows `30 23 * * *` (23:30 UTC = 00:30 WAT)
3. Click **Trigger Run** to test it manually
4. Check logs — you should see:
   ```
   No overdue plans found.
   No reminders to send.
   ```

---

### Step 5 — Configure Vercel Frontend

In your Vercel project settings → Environment Variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://evolvlearn-backend.onrender.com/api/v1` |

> Vercel only serves the Next.js frontend. It does NOT run Django or management commands.

---

## Ongoing Deployments

Every `git push` to `main` triggers:
1. Render rebuilds the web service
2. `startup.sh` runs `migrate` and `collectstatic`
3. Gunicorn starts with the updated code

No manual steps needed after the first deployment.

---

## Useful Render Shell Commands

```bash
# Check migration status
python manage.py showmigrations

# Apply specific migration
python manage.py migrate courses

# Create superuser
python manage.py createsuperuser

# Test instalment deadline enforcement (dry run)
python manage.py enforce_installment_deadlines --dry-run

# Check Django configuration
python manage.py check --deploy
```

---

## Free Tier Limitations

| Service | Free Tier Limit |
|---|---|
| Web Service | Spins down after 15 min inactivity — first request is slow |
| PostgreSQL | 1GB storage, expires after 90 days (upgrade to paid to keep) |
| Cron Job | Included on free tier |

For production traffic, upgrade the web service to the **Starter** plan ($7/mo)
to avoid cold starts.

---

## Removing Azure Configuration

The following Azure-specific files are no longer needed for Render:
- `.deployment` (root and evolv_backend/)
- `azure-pipelines.yml`

They can remain in the repo without causing issues, but can be deleted when
you are fully migrated to Render.
