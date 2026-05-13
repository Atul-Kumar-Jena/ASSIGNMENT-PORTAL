# Assignment Submission Portal

A fully functional, modular Single Page Application (SPA) for managing classes, assignments, and submissions across three roles: **Admin**, **Trainer**, and **Student**.

---

## Features

| Role | Capabilities |
|------|-------------|
| **Admin** | View system overview, add/remove trainers & students |
| **Trainer** | Create classes (with join codes), create assignments, grade submissions, manage enrolled students |
| **Student** | Join classes via code, view/submit assignments, track grades & averages |

---

## Tech Stack

- **HTML5** semantic markup
- **Tailwind CSS** (CDN) for utility-first styling
- **Font Awesome** (CDN) for icons
- **Vanilla ES6 Modules** — no build step required
- **localStorage** for persistent client-side data

---

## Project Structure

```
assignment-portal/
├── index.html              # Application shell
├── css/
│   └── style.css           # Global styles, animations, scrollbar, print styles
├── js/
│   ├── core/
│   │   ├── store.js        # State management & localStorage persistence
│   │   └── utils.js        # Toast notifications, modal helpers, formatters
│   ├── features/
│   │   ├── auth.js         # Login & registration UI
│   │   ├── admin.js        # Admin dashboard & user CRUD
│   │   ├── trainer.js      # Class, assignment, and grading management
│   │   ├── student.js      # Enrollment, submission, and grade viewing
│   │   └── shared.js       # Profile settings (all roles)
│   └── app.js              # Router, layout shell, event delegation hub
└── README.md
```

---

## Quick Start (Local)

1. **Download** or clone the project folder.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
3. No server or build step is required — ES modules load directly via `file://` or `http://`.

> **Note:** If opening via `file://`, some browsers may require you to enable local file access for ES modules, or use a simple local server (see below).

### Optional: Local Server

Using Python:
```bash
cd assignment-portal
python -m http.server 8000
# Visit http://localhost:8000
```

Using Node.js (npx):
```bash
cd assignment-portal
npx serve
```

Using VS Code: install the **Live Server** extension and click "Go Live".

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@portal.com` | `admin123` |
| Trainer | `sarah@uni.com` | `trainer123` |
| Student | `john@student.com` | `student123` |

New students can also register via the **Student Signup** tab.

---

## Deployment Options

### 1. GitHub Pages (Free)
1. Push this folder to a GitHub repository.
2. Go to **Settings > Pages**.
3. Select branch `main` and folder `/ (root)`.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### 2. Netlify (Free)
1. Drag and drop the `assignment-portal` folder into [Netlify Drop](https://app.netlify.com/drop).
2. Get an instant live URL.

### 3. Vercel (Free)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` inside the project folder.
3. Follow the prompts.

### 4. Traditional Hosting
Upload all files via FTP/SFTP to any static web host (Apache, Nginx, etc.). Ensure `index.html` is at the root.

---

## Data Model

All data is stored in the browser's **localStorage** under the key `portal_data`.

### Entities

- **User**: `{ id, name, email, password, role, createdAt }`
- **Class**: `{ id, trainerId, name, description, code, students[], createdAt }`
- **Assignment**: `{ id, classId, title, description, dueDate, totalMarks, createdAt }`
- **Submission**: `{ id, assignmentId, studentId, content, submittedAt, grade, feedback }`

### Session
Current user is cached under `portal_session` for automatic re-login on refresh.

---

## Architecture Notes

### Event Delegation
All user interactions flow through a single `handleAction` method in `app.js`. Buttons use `data-action` attributes instead of inline `onclick` handlers, keeping HTML clean and JS maintainable.

### Module Separation
- **Core**: Reusable infrastructure (store, utils)
- **Features**: Role-specific business logic (auth, admin, trainer, student)
- **Shared**: Cross-cutting concerns (profile)

### State Flow
```
User Action → Event Delegation → Store Update → localStorage Save → Re-render
```

---

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

Requires ES6 Module support and CSS Grid/Flexbox.

---

## License

MIT — free for educational and commercial use.
