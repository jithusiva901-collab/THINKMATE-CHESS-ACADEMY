# ThinkMate Chess Academy

Student and administrator portal using the academy artwork, Kotagiri location, contact 9486707315, and ₹1,000 per student monthly for 8 classes.

## Start the website

Install Node.js 20 or newer, open a terminal in this folder, and run `npm start` (or `node server.js`). No package installation is required. Opening index.html directly is no longer supported because sign-in is checked by the server.

- Student login: http://127.0.0.1:4173/login
- Administrator login: http://127.0.0.1:4173/admin/login

Unauthenticated visitors are redirected to login. The student/admin preview switch has been removed.

## First administrator login

On first startup, the server creates one administrator account. Its email is `admin@thinkmate.academy`; its randomly generated password is saved in `.private/initial-admin.txt`. This file is never served by the website. Keep it private. Sign in through the admin login and use **Change password** to choose your own password.

Alternatively, set `THINKMATE_ADMIN_EMAIL` and `THINKMATE_ADMIN_PASSWORD` before first startup. The password must contain 12–128 characters. These variables only initialize a new database; they do not overwrite an existing administrator account.

## Create individual student accounts

1. Sign in as the administrator.
2. Open **Students**, then **Add student**.
3. Enter the student's name, email, password, level, and monthly fee status.
4. Save the student and privately provide their email and password to them.
5. The student signs in through the student login. Their profile, lesson progress, puzzle result, and reservations belong to their account.

Only admins can create accounts, change fee statuses, manage classes, or publish announcements. Students cannot sign in through the admin login. An admin can use **Set password** beside a student to reset their password. Removing a student account immediately revokes that account's access.

Both roles have **Log out** and **Change password**. Logout invalidates the current server session. A password change revokes all of that account's sessions. Sessions expire after eight hours and are cleared when the server restarts.

## Schedule classes for individual students

In the admin portal, open **Students** and click **Schedule class** beside a student. That student is preselected. Enter a title, date, time in IST, level, and coach, then save. To schedule a group, select additional students in the same form.

Open **Manage classes** to filter the schedule by student. Each class shows the assigned students. **Edit schedule** lets you change the date, time, coach, or assignments. Students only receive their own assigned classes from the server and cannot reserve another student's class. When an assignment is removed, any reservation for that student is also removed.

Existing shared classes from the earlier version remain in the admin portal as unassigned. Edit them to assign students before they appear in student accounts. If a student is deleted, they are removed from class assignments; classes with no remaining assigned students are removed.

## Data and security

Passwords are salted and hashed with Node's scrypt. Authentication uses random server-side sessions and HttpOnly, SameSite cookies. Mutating requests require a matching origin and session CSRF token. Login attempts are throttled. The server checks authorization on every protected request and only sends a student their own student record. Private files, source files, and credentials cannot be downloaded through the web server.

Accounts, classes, announcements, fee statuses, and progress are stored in `.private/database.json`, independent of browser local storage. The old demo's sample student records and browser data are not imported. New installations start with no students or scheduled classes, so add the academy's actual records.

The download ZIP contains source files and artwork only; it excludes the running site's private database and initial credentials. Back up the private database securely. JSON storage suits a small local installation; use a managed database, operational backups, and a recovery process before a public production rollout. No online payments are processed; fee statuses are administrator-maintained records. Attendance and payment processing are not implemented. The puzzle uses a fixed Rh8# solution, and lessons provide introductory content.

## Deployment configuration

See DEPLOYMENT.md for the prepared hosting setup. Dockerfile and compose.yaml include HTTPS proxying and a persistent account-data volume. No public deployment has been completed yet.

This preview listens on localhost. For hosting, use an HTTPS reverse proxy and set `THINKMATE_ORIGIN` to the exact public HTTPS origin, `THINKMATE_SECURE_COOKIE=true`, and `HOST` as required by your hosting environment. `PORT` defaults to 4173. `THINKMATE_DATA_DIR` changes the private storage location. Run a single Node process with this JSON store; do not run multiple instances against the same file. Keep private files outside any public web root and restrict their filesystem permissions. Host configuration and public deployment are not included in the local preview.

## Verification

Run `npm test`. The automated integration check covers login requirements, separate role login, unauthorized API access, CSRF/origin checks, student account isolation, student creation, duplicate accounts, password resets and changes, assigned-class visibility, restricted reservations, schedule reassignment, group sessions, invalid dates and assignments, class/progress persistence, logout and session replay, account removal, private-file protection, and login throttling. Tests use a separate temporary database and port 4174.
