# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/09df458b-dedc-46e2-af46-e15d28209b01

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/09df458b-dedc-46e2-af46-e15d28209b01) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment variables

The application expects the following variables at build time:

- `VITE_SUPABASE_URL` – your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` – the public anon key for your project.
- `PRICE_ID_STARTER_MONTHLY` – Stripe price ID for the monthly Starter plan.
- `PRICE_ID_STARTER_YEARLY` – Stripe price ID for the yearly Starter plan.
- `PRICE_ID_PRO_MONTHLY` – Stripe price ID for the monthly Pro plan.
- `PRICE_ID_PRO_YEARLY` – Stripe price ID for the yearly Pro plan.
- `PRICE_ID_PREMIUM_MONTHLY` – Stripe price ID for the monthly Premium plan.
- `PRICE_ID_PREMIUM_YEARLY` – Stripe price ID for the yearly Premium plan.
- `APP_URL` – base URL used by Supabase functions when no `Origin` header is provided. This must be defined when running functions without an `Origin` header in the request.

Supabase functions (`supabase/functions/*`) also use the following variables at runtime:

- `STRIPE_SECRET_KEY` – secret key for Stripe used in `create-checkout-session`, `verify-subscription` and `stripe-webhook`.
- `STRIPE_WEBHOOK_SECRET` – webhook signing secret used by `stripe-webhook`.
- `SUPABASE_SERVICE_ROLE_KEY` – service role key used by `stripe-webhook` for privileged database access.
- `SUPABASE_URL` – your Supabase project URL, used by all functions.
- `SUPABASE_ANON_KEY` – anon key used by functions in `_shared/stripeUtils.ts` to authenticate users.

Create a `.env` file in the project root and define these values when running locally or configure them in the Supabase dashboard for your functions.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/09df458b-dedc-46e2-af46-e15d28209b01) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
