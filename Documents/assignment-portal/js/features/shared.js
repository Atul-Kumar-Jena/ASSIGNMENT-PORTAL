/**
 * shared.js
 * ============================================
 * Shared Components Module
 * Profile settings accessible to all authenticated roles.
 */

import { store } from '../core/store.js';
import { Utils } from '../core/utils.js';

export const Shared = {
    /** Profile form: name, email, password change */
    renderProfile(container, app) {
        const user = store.currentUser;
        container.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl">
                <form id="profile-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" name="name" value="${user.name}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" name="email" value="${user.email}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                            <input type="password" name="password" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input type="password" name="passwordConfirm" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                    </div>
                    <div class="pt-4 border-t border-gray-100 flex justify-end">
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const name = fd.get('name');
            const email = fd.get('email');
            const pass = fd.get('password');
            const passConfirm = fd.get('passwordConfirm');

            if (pass && pass !== passConfirm) {
                Utils.showToast('Passwords do not match', 'error');
                return;
            }

            const user = store.users.find(u => u.id === store.currentUser.id);
            user.name = name;
            user.email = email;
            if (pass) user.password = pass;

            store.currentUser = user;
            localStorage.setItem('portal_session', JSON.stringify(user));
            store.save();
            Utils.showToast('Profile updated successfully', 'success');
            app.renderDashboard(); // Refresh sidebar name
        });
    }
};
