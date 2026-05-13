/**
 * utils.js
 * ============================================
 * Shared Utilities
 * Toast notifications, modal helpers, and formatters.
 */

export const Utils = {
    /** Reveal a hidden modal by ID */
    openModal(id) {
        document.getElementById(id)?.classList.remove('hidden');
    },

    /** Hide a modal by ID */
    closeModal(id) {
        document.getElementById(id)?.classList.add('hidden');
    },

    /**
     * Display a toast notification
     * @param {string} message - Text to display
     * @param {string} type    - 'success' | 'error'
     */
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const colors = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

        toast.className = `${colors} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-x-full`;
        toast.innerHTML = `<i class="fas ${icon}"></i> <span class="font-medium">${message}</span>`;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full');
        });

        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /** Format ISO date string to locale date */
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }
};
