/**
 * app.js
 * ============================================
 * Application Entry Point & Router
 * Orchestrates layout, navigation, and feature modules.
 * Uses event delegation to handle all user interactions.
 */

import { store } from './core/store.js';
import { Utils } from './core/utils.js';
import { Auth } from './features/auth.js';
import { Admin } from './features/admin.js';
import { Trainer } from './features/trainer.js';
import { Student } from './features/student.js';

class App {
    constructor() {
        this.currentPage = 'overview';
        this.init();
    }

    /** Bootstrap the application */
    init() {
        store.init();

        // Global event delegation for all data-action buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const extra = btn.dataset.extra;

            this.handleAction(action, id, extra, e);
        });

        // Route to auth or dashboard based on session
        if (store.currentUser) {
            this.renderDashboard();
        } else {
            Auth.render(this);
        }
    }

    /**
     * Central action router — replaces all inline onclick handlers
     * from the original monolithic version with clean delegation.
     */
    handleAction(action, id, extra, event) {
        switch (action) {
            // Auth & Layout
            case 'logout':
                store.logout();
                Utils.showToast('Logged out successfully', 'success');
                Auth.render(this);
                break;

            case 'navigate':
                if (id) this.navigate(id);
                break;

            case 'toggleSidebar': {
                const aside = document.querySelector('aside');
                aside.classList.toggle('hidden');
                aside.classList.toggle('absolute');
                aside.classList.toggle('h-full');
                break;
            }

            // Modals
            case 'openAddUserModal':
                Utils.openModal('add-user-modal');
                break;
            case 'openAddClassModal':
                Utils.openModal('add-class-modal');
                break;
            case 'openAddAssignmentModal':
                Utils.openModal('add-assignment-modal');
                break;
            case 'openJoinClassModal':
                Utils.openModal('join-class-modal');
                break;
            case 'closeModal':
                if (id) Utils.closeModal(id);
                break;

            // Admin actions
            case 'deleteUser':
                if (id) Admin.deleteUser(id, this);
                break;

            // Trainer actions
            case 'deleteClass':
                if (id) Trainer.deleteClass(id, this);
                break;
            case 'viewClassStudents':
                if (id) Trainer.viewClassStudents(id);
                break;
            case 'removeStudentFromClass':
                if (id && extra) Trainer.removeStudentFromClass(id, extra, this);
                break;
            case 'deleteAssignment':
                if (id) Trainer.deleteAssignment(id, this);
                break;
            case 'gradeSubmission':
                if (id) Trainer.gradeSubmission(id);
                break;

            // Student actions
            case 'openSubmitModal':
                if (id) Student.openSubmitModal(id);
                break;

            default:
                console.warn('Unhandled action:', action);
        }
    }

    /** Main router — swaps main-content based on role + page */
    navigate(page) {
        this.currentPage = page;

        // Update sidebar active indicator
        document.querySelectorAll('.sidebar-link').forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Animate content swap
        const container = document.getElementById('main-content');
        container.innerHTML = '';
        container.classList.remove('fade-in');
        void container.offsetWidth; // force reflow
        container.classList.add('fade-in');

        // Dispatch to role-specific feature module
        const role = store.currentUser.role;
        if (role === 'admin') Admin.renderPage(page, container, this);
        else if (role === 'trainer') Trainer.renderPage(page, container, this);
        else Student.renderPage(page, container, this);
    }

    /** Render the persistent dashboard shell (sidebar + main area) */
    renderDashboard() {
        const user = store.currentUser;

        // Sidebar configuration per role
        const sidebarConfig = {
            admin: [
                { id: 'overview', icon: 'fa-chart-pie', label: 'Overview' },
                { id: 'trainers', icon: 'fa-chalkboard-teacher', label: 'Trainers' },
                { id: 'students', icon: 'fa-user-graduate', label: 'Students' },
                { id: 'profile', icon: 'fa-user-cog', label: 'Profile' }
            ],
            trainer: [
                { id: 'overview', icon: 'fa-home', label: 'Dashboard' },
                { id: 'classes', icon: 'fa-users', label: 'My Classes' },
                { id: 'assignments', icon: 'fa-tasks', label: 'Assignments' },
                { id: 'submissions', icon: 'fa-clipboard-check', label: 'Submissions' },
                { id: 'profile', icon: 'fa-user-cog', label: 'Profile' }
            ],
            student: [
                { id: 'overview', icon: 'fa-home', label: 'Dashboard' },
                { id: 'classes', icon: 'fa-school', label: 'My Classes' },
                { id: 'assignments', icon: 'fa-pen-nib', label: 'My Assignments' },
                { id: 'grades', icon: 'fa-chart-line', label: 'Grades' },
                { id: 'profile', icon: 'fa-user-cog', label: 'Profile' }
            ]
        };

        const items = sidebarConfig[user.role] || [];

        document.getElementById('app').innerHTML = `
            <div class="flex h-screen bg-gray-50">
                <!-- Desktop Sidebar -->
                <aside class="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-20">
                    <div class="p-6 flex items-center gap-3 border-b border-gray-100">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-graduation-cap text-white text-sm"></i>
                        </div>
                        <span class="font-bold text-lg text-gray-800">EduPortal</span>
                    </div>

                    <nav class="flex-1 overflow-y-auto py-4">
                        ${items.map(item => `
                            <button data-action="navigate" data-id="${item.id}" 
                               class="sidebar-link w-full text-left flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors" 
                               data-page="${item.id}">
                                <i class="fas ${item.icon} w-5 text-center"></i>
                                <span class="font-medium">${item.label}</span>
                            </button>
                        `).join('')}
                    </nav>

                    <div class="p-4 border-t border-gray-100">
                        <div class="flex items-center gap-3 mb-4 px-2">
                            <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                ${user.name.charAt(0)}
                            </div>
                            <div class="overflow-hidden">
                                <p class="text-sm font-semibold text-gray-800 truncate">${user.name}</p>
                                <p class="text-xs text-gray-500 capitalize">${user.role}</p>
                            </div>
                        </div>
                        <button data-action="logout" class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </aside>

                <!-- Mobile Header -->
                <div class="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-graduation-cap text-white text-sm"></i>
                        </div>
                        <span class="font-bold text-gray-800">EduPortal</span>
                    </div>
                    <button data-action="toggleSidebar" class="text-gray-600">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>

                <!-- Main Content Area -->
                <main class="flex-1 overflow-y-auto bg-gray-50 pt-16 md:pt-0">
                    <div id="main-content" class="p-6 md:p-10 max-w-7xl mx-auto fade-in"></div>
                </main>
            </div>
        `;

        this.navigate('overview');
    }
}

// Instantiate and expose for any legacy needs
const app = new App();
