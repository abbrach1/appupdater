# Employee Portal with Firebase

This project allows employees to log in and view/download files uploaded specifically for them. Admins can upload files for individual employees. Built with React and Firebase (Auth, Firestore, Storage).

## Features
- Employee login (Firebase Auth)
- Each employee sees only their files
- Admin can upload files for each employee
- Mobile-friendly, modern UI (Material-UI)

## Setup
1. Clone the repo or copy files to your machine.
2. Run `npm install` to install dependencies.
3. Create a Firebase project at https://console.firebase.google.com/ and enable Email/Password authentication.
4. In the project root, create a file named `.env` with your Firebase config:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Run `npm start` to launch the app.

## Usage
- Employees log in to see/download their files.
- Admins can upload files for employees via the UI.

---

If you need help finding your Firebase config, see: https://firebase.google.com/docs/web/setup#config-object
