/**
 * auth.js
 * ============================================
 * Authentication Feature Module
 * Handles login, registration, and the public landing UI.
 */

import { store } from '../core/store.js';
import { Utils } from '../core/utils.js';

export const Auth = {
    /**
     * Render the authentication screen (login / register)
     * @param {App} appInstance - Reference to main app for callbacks
     */
    render(appInstance) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md fade-in">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <i class="fas fa-graduation-cap text-white text-3xl"></i>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-900">Assignment Portal</h1>
                        <p class="text-gray-500 text-sm mt-2">Sign in to access your dashboard</p>
                    </div>

                    <!-- Auth Tabs -->
                    <div class="flex bg-gray-100 p-1 rounded-lg mb-6">
                        <button data-auth-tab="login" class="auth-tab flex-1 py-2 text-sm font-medium rounded-md bg-white shadow-sm text-gray-900 transition-all">Login</button>
                        <button data-auth-tab="register" class="auth-tab flex-1 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 transition-all">Student Signup</button>
                    </div>

                    <!-- Login Form -->
                    <form id="login-form" class="auth-form space-y-4" data-form="login">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" name="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@example.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" name="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••">
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all">
                            Sign In
                        </button>
                    </form>

                    <!-- Register Form -->
                    <form id="register-form" class="auth-form space-y-4 hidden" data-form="register">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" name="name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" name="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@student.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" name="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••">
                        </div>
                        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all">
                            Create Account
                        </button>
                    </form>

                    <!-- Demo Credentials Helper -->
                    <div class="mt-6 pt-4 border-t border-gray-100 text-center">
                        <p class="text-xs text-gray-400">Demo Credentials:</p>
                        <div class="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                            <button data-demo="admin@portal.com,admin123" class="hover:text-blue-600 underline">Admin</button>
                            <button data-demo="sarah@uni.com,trainer123" class="hover:text-blue-600 underline">Trainer</button>
                            <button data-demo="john@student.com,student123" class="hover:text-blue-600 underline">Student</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachListeners(appInstance);
    },

    /** Wire up form and tab event listeners after DOM injection */
    attachListeners(appInstance) {
        // Tab switching
        document.querySelectorAll('[data-auth-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.authTab;
                document.querySelectorAll('.auth-tab').forEach(b => {
                    b.classList.remove('bg-white', 'shadow-sm', 'text-gray-900');
                    b.classList.add('text-gray-500');
                });
                e.target.classList.add('bg-white', 'shadow-sm', 'text-gray-900');
                e.target.classList.remove('text-gray-500');

                document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
                document.getElementById(`${tab}-form`).classList.remove('hidden');
            });
        });

        // Demo credential fillers
        document.querySelectorAll('[data-demo]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const [email, pass] = e.target.dataset.demo.split(',');
                document.querySelector('#login-form input[name="email"]').value = email;
                document.querySelector('#login-form input[name="password"]').value = pass;
            });
        });

        // Login handler
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            if (store.login(fd.get('email'), fd.get('password'))) {
                Utils.showToast('Login successful!', 'success');
                appInstance.renderDashboard();
            } else {
                Utils.showToast('Invalid email or password', 'error');
            }
        });

        // Registration handler
        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const name = fd.get('name');
            const email = fd.get('email');
            const password = fd.get('password');

            if (store.users.find(u => u.email === email)) {
                Utils.showToast('Email already registered', 'error');
                return;
            }

            store.users.push({
                id: store.generateId(),
                name, email, password,
                role: 'student',
                createdAt: new Date().toISOString()
            });
            store.save();
            Utils.showToast('Account created! Please login.', 'success');

            // Switch to login tab visually
            document.querySelector('[data-auth-tab="login"]').click();
            e.target.reset();
        });
    }
};
