/**
 * admin.js
 * ============================================
 * Admin Feature Module
 * Overview dashboard and CRUD for trainers & students.
 */

import { store } from '../core/store.js';
import { Utils } from '../core/utils.js';
import { Shared } from './shared.js';

export const Admin = {
    /** Route to correct admin sub-page */
    renderPage(page, container, app) {
        if (page === 'overview') this.renderOverview(container);
        else if (page === 'trainers') this.renderUserManagement(container, 'trainer', app);
        else if (page === 'students') this.renderUserManagement(container, 'student', app);
        else if (page === 'profile') Shared.renderProfile(container, app);
    },

    /** Admin landing: high-level metrics */
    renderOverview(container) {
        const totalTrainers = store.users.filter(u => u.role === 'trainer').length;
        const totalStudents = store.users.filter(u => u.role === 'student').length;
        const totalClasses = store.classes.length;

        container.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Admin Overview</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-500 text-sm font-medium">Total Trainers</h3>
                        <div class="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><i class="fas fa-chalkboard-teacher"></i></div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800">${totalTrainers}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-500 text-sm font-medium">Total Students</h3>
                        <div class="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><i class="fas fa-user-graduate"></i></div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800">${totalStudents}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-500 text-sm font-medium">Active Classes</h3>
                        <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><i class="fas fa-school"></i></div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800">${totalClasses}</p>
                </div>
            </div>
        `;
    },

    /** Reusable user table + add modal for trainers or students */
    renderUserManagement(container, role, app) {
        const users = store.users.filter(u => u.role === role);
        const title = role === 'trainer' ? 'Trainer Management' : 'Student Management';

        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">${title}</h2>
                <button data-action="openAddUserModal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all">
                    <i class="fas fa-plus"></i> Add ${role}
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${users.length === 0 ? `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No ${role}s found.</td></tr>` : ''}
                            ${users.map(u => `
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                                ${u.name.charAt(0)}
                                            </div>
                                            <span class="font-medium text-gray-900">${u.name}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-gray-600">${u.email}</td>
                                    <td class="px-6 py-4 text-gray-500 text-sm">${Utils.formatDate(u.createdAt)}</td>
                                    <td class="px-6 py-4 text-right">
                                        <button data-action="deleteUser" data-id="${u.id}" class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors" title="Remove">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Add User Modal -->
            <div id="add-user-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-gray-800">Add New ${role}</h3>
                        <button data-action="closeModal" data-id="add-user-modal" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <form id="add-user-form" data-role="${role}">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" name="name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input type="password" name="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                        </div>
                        <div class="mt-8 flex justify-end gap-3">
                            <button type="button" data-action="closeModal" data-id="add-user-modal" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors">Create Account</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Attach form listener directly (dynamic form)
        document.getElementById('add-user-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const name = fd.get('name');
            const email = fd.get('email');
            const password = fd.get('password');
            const r = e.target.dataset.role;

            if (store.users.find(u => u.email === email)) {
                Utils.showToast('Email already exists', 'error');
                return;
            }

            store.users.push({
                id: store.generateId(),
                name, email, password,
                role: r,
                createdAt: new Date().toISOString()
            });
            store.save();
            Utils.closeModal('add-user-modal');
            Utils.showToast(`${r} added successfully`, 'success');
            app.navigate(r === 'trainer' ? 'trainers' : 'students');
        });
    },

    /** Remove user and cascade-delete related records */
    deleteUser(id, app) {
        if (!confirm('Are you sure you want to remove this user?')) return;

        const userToDelete = store.users.find(u => u.id === id);
        store.users = store.users.filter(u => u.id !== id);

        if (userToDelete?.role === 'student') {
            store.submissions = store.submissions.filter(s => s.studentId !== id);
            store.classes.forEach(c => {
                c.students = c.students.filter(sId => sId !== id);
            });
        } else if (userToDelete?.role === 'trainer') {
            const classesToRemove = store.classes.filter(c => c.trainerId === id).map(c => c.id);
            store.classes = store.classes.filter(c => c.trainerId !== id);
            store.assignments = store.assignments.filter(a => !classesToRemove.includes(a.classId));
            store.submissions = store.submissions.filter(s => {
                const assignment = store.assignments.find(a => a.id === s.assignmentId);
                return assignment !== undefined;
            });
        }

        store.save();
        Utils.showToast('User removed', 'success');
        app.navigate(app.currentPage);
    }
};
