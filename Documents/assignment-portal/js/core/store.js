/**
 * store.js
 * ============================================
 * Central State Management & Persistence Layer
 * Handles all data operations and synchronizes with localStorage.
 * 
 * Data Entities:
 *   - users:       { id, name, email, password, role, createdAt }
 *   - classes:     { id, trainerId, name, description, code, students[], createdAt }
 *   - assignments: { id, classId, title, description, dueDate, totalMarks, createdAt }
 *   - submissions: { id, assignmentId, studentId, content, submittedAt, grade, feedback }
 */

const STORAGE_KEY = 'portal_data';
const SESSION_KEY = 'portal_session';

export const store = {
    currentUser: null,
    users: [],
    classes: [],
    assignments: [],
    submissions: [],

    /** Initialize store from localStorage or seed defaults */
    init() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            this.users = parsed.users || [];
            this.classes = parsed.classes || [];
            this.assignments = parsed.assignments || [];
            this.submissions = parsed.submissions || [];
        } else {
            this.seedData();
        }

        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            this.currentUser = JSON.parse(session);
        }
    },

    /** Seed default accounts for demonstration */
    seedData() {
        this.users = [
            { id: 'admin1', name: 'System Admin', email: 'admin@portal.com', password: 'admin123', role: 'admin', createdAt: new Date().toISOString() },
            { id: 't1', name: 'Dr. Sarah Smith', email: 'sarah@uni.com', password: 'trainer123', role: 'trainer', createdAt: new Date().toISOString() },
            { id: 's1', name: 'John Doe', email: 'john@student.com', password: 'student123', role: 'student', createdAt: new Date().toISOString() }
        ];
        this.save();
    },

    /** Persist entire state to localStorage */
    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            users: this.users,
            classes: this.classes,
            assignments: this.assignments,
            submissions: this.submissions
        }));
    },

    /** Authenticate user and establish session */
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return true;
        }
        return false;
    },

    /** Clear session and return to anonymous state */
    logout() {
        this.currentUser = null;
        localStorage.removeItem(SESSION_KEY);
    },

    /** Generate unique ID using timestamp + random */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /** Generate 6-character uppercase class code */
    generateCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
};
