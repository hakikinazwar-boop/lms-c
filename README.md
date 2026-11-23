This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database

This project uses MongoDB with Mongoose and NextAuth Credentials. Copy `.env.example` to `.env.local`, set `MONGODB_URI`, and replace both authentication placeholders with separate random values of at least 32 bytes before starting the app. In PowerShell, generate a value with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

The schemas in `models/index.ts` cover users and roles, classes, subjects, teacher assignments, schedules, learning materials, tasks and submissions, grades, daily attendance, and teacher activity. Models use timestamps and references between related records; user password hashes are excluded from query results by default. Collections and indexes are created by MongoDB when the models are first used.

1. Start the app and open `/setup` to create the first Admin account. Enter an Admin ID/username, name, email, password, and the `INITIAL_ADMIN_SETUP_TOKEN` value from `.env.local`. Setup is disabled if the database already contains any user.
2. Sign in at `/login` using the Admin role, email, and password. Passwords are stored as bcrypt hashes.
3. While signed in as Admin, create role accounts with `POST /api/Admin/users`. Send JSON with `name`, `email`, `password` (at least 12 characters), and `role` (`Siswa`, `Guru`, `Admin`, `Kepsek`, or `Kurikulum`). Student accounts also require `nisn`; teacher accounts require `nip`. The same endpoint supports `GET` to list accounts.

The Admin dashboard is restricted to Admin accounts. Guru accounts are redirected to `/guru`, where the dashboard shows their own teaching assignments, materials, tasks, schedule, and completed submissions that need grading. Kurikulum accounts are redirected to `/kurikulum`, a dashboard with teacher, grade, subject, and schedule summaries from MongoDB. The Kurikulum teacher directory is available at `/kurikulum/guru`: it reads subject/class assignments from the existing collections and supports searching, filtering, CSV export, teacher creation, and profile/status updates. Department filters use the category of each assigned subject; no duplicate department field or schema migration is required. Class management is available at `/guru/kelolakelas`: teachers can create SMK classes through `POST /api/Guru/kelas`; the class is assigned to its creator as homeroom teacher, and students are assigned by Admin. Teachers can record today's attendance through `POST /api/Guru/absensi` for classes they teach or lead.

Teachers manage learning materials and tasks at `/guru/materitugas`. Materials can be created through `POST /api/Guru/materi`, and tasks through `POST /api/Guru/tugas`; both endpoints restrict content to an assigned class and subject. Material links must use HTTP or HTTPS. Teachers can switch their own materials or tasks between `Draft` and `Aktif` using the corresponding `PATCH /api/Guru/materi/:id` and `PATCH /api/Guru/tugas/:id` endpoints. Other roles can sign in and reach `/portal`. Classes are configured for SMK grades 10–12. Use the existing `connectToDatabase` helper from `lib/mongoodb.ts` in server-side code before querying or saving records.

## Demo Guru Accounts

Guru credentials are configured in `.env.local` and can be created or reset in MongoDB with:

```powershell
npm run create:guru
```

The script creates/updates two active Guru accounts and bcrypt-hashes their passwords:

- Ibu Siti Aminah
- Bapak Budi Santoso

The email, NIP, and password values are listed in the `DEMO_TEACHER_*` entries in `.env.local`.

## Demo Kurikulum Account

Create or reset the active Kurikulum demo account in MongoDB with `create-kurikulum.mjs`:

```powershell
npm run create:kurikulum
```

Default login credentials:

- Role: `Kurikulum`
- Email: `kurikulum.demo@citra.local`
- Username: `kurikulum`
- Password: `Kurikulum#2026!`

Sign in at `/login`, choose the `Kurikulum` role, then enter the email or username and password. The script bcrypt-hashes the password and creates/updates the `users` collection entry. Override the defaults with `DEMO_CURRICULUM_NAME`, `DEMO_CURRICULUM_USERNAME`, `DEMO_CURRICULUM_EMAIL`, and `DEMO_CURRICULUM_PASSWORD` in `.env.local`. Change the demo password before using this account outside a local/demo environment.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
