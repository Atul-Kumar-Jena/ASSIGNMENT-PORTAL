/**
 * student.js
 * ============================================
 * Student Feature Module
 * Dashboard, class enrollment, assignment submission, and grade viewing.
 */

import { store } from '../core/store.js';
import { Utils } from '../core/utils.js';
import { Shared } from './shared.js';

export const Student = {
    renderPage(page, container, app) {
        if (page === 'overview') this.renderOverview(container);
        else if (page === 'classes') this.renderClasses(container, app);
        else if (page === 'assignments') this.renderAssignments(container, app);
        else if (page === 'grades') this.renderGrades(container);
        else if (page === 'profile') Shared.renderProfile(container, app);
    },

    /** Student landing: enrolled classes, pending work, average grade */
    renderOverview(container) {
        const user = store.currentUser;
        const myClasses = store.classes.filter(c => c.students.includes(user.id));
        const myAssignments = store.assignments.filter(a => myClasses.some(c => c.id === a.classId));
        const mySubmissions = store.submissions.filter(s => s.studentId === user.id);
        const pendingCount = myAssignments.filter(a => !mySubmissions.some(s => s.assignmentId === a.id) && new Date(a.dueDate) > new Date()).length;

        container.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Student Dashboard</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-gray-500 text-sm font-medium">Enrolled Classes</h3>
                        <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><i class="fas fa-school"></i></div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800">${myClasses.length}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-gray-500 text-sm font-medium">Pending Assignments</h3>
                        <div class="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><i class="fas fa-clock"></i></div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800">${pendingCount}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-gray-500 text-sm font-medium">Avg. Grade</h3>
                        <div class="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><i class="fas fa-chart-line"></i></div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800">${this.calculateAverageGrade(user.id)}</p>
                </div>
            </div>
        `;
    },

    /** Enrolled classes grid + join-by-code modal */
    renderClasses(container, app) {
        const user = store.currentUser;
        const myClasses = store.classes.filter(c => c.students.includes(user.id));

        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">My Classes</h2>
                <button data-action="openJoinClassModal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                    <i class="fas fa-plus"></i> Join Class
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${myClasses.map(c => {
                    const trainer = store.users.find(u => u.id === c.trainerId);
                    return `
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-lg font-bold text-gray-800">${c.name}</h3>
                                    <p class="text-sm text-gray-500">by ${trainer?.name || 'Unknown'}</p>
                                </div>
                                <span class="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg tracking-wider">${c.code}</span>
                            </div>
                            <p class="text-gray-600 text-sm mb-4">${c.description || 'No description'}</p>
                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                <i class="fas fa-user-graduate"></i> ${c.students.length} Students
                            </div>
                        </div>
                    `;
                }).join('')}
                ${myClasses.length === 0 ? `<div class="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">You haven't joined any classes yet.</div>` : ''}
            </div>

            <!-- Join Class Modal -->
            <div id="join-class-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm m-4 p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Join a Class</h3>
                    <form id="join-class-form">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Class Code</label>
                            <input type="text" name="code" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="e.g. ABC123">
                        </div>
                        <div class="mt-6 flex justify-end gap-3">
                            <button type="button" data-action="closeModal" data-id="join-class-modal" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md">Join</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('join-class-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = e.target.code.value.toUpperCase();
            const cls = store.classes.find(c => c.code === code);

            if (!cls) {
                Utils.showToast('Invalid class code', 'error');
                return;
            }
            if (cls.students.includes(store.currentUser.id)) {
                Utils.showToast('Already enrolled in this class', 'error');
                return;
            }

            cls.students.push(store.currentUser.id);
            store.save();
            Utils.closeModal('join-class-modal');
            Utils.showToast('Successfully joined class!', 'success');
            app.navigate('classes');
        });
    },

    /** Assignment list with submit buttons and status badges */
    renderAssignments(container, app) {
        const user = store.currentUser;
        const myClasses = store.classes.filter(c => c.students.includes(user.id));
        const assignments = store.assignments.filter(a => myClasses.some(c => c.id === a.classId));
        const submissions = store.submissions.filter(s => s.studentId === user.id);

        container.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">My Assignments</h2>
            <div class="space-y-4">
                ${assignments.map(a => {
                    const cls = store.classes.find(c => c.id === a.classId);
                    const submission = submissions.find(s => s.assignmentId === a.id);
                    const isSubmitted = !!submission;
                    const isExpired = new Date(a.dueDate) < new Date();

                    let statusBadge = '';
                    if (isSubmitted) {
                        statusBadge = `<span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Submitted</span>`;
                    } else if (isExpired) {
                        statusBadge = `<span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Expired</span>`;
                    } else {
                        statusBadge = `<span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>`;
                    }

                    return `
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <h3 class="font-bold text-gray-800">${a.title}</h3>
                                        ${statusBadge}
                                    </div>
                                    <p class="text-sm text-gray-500 mb-2">${cls.name} • Due: ${new Date(a.dueDate).toLocaleDateString()}</p>
                                    <p class="text-sm text-gray-600">${a.description}</p>
                                </div>
                                <div class="flex items-center gap-3">
                                    ${!isSubmitted && !isExpired ? `
                                        <button data-action="openSubmitModal" data-id="${a.id}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition-all">
                                            Submit Work
                                        </button>
                                    ` : ''}
                                    ${isSubmitted ? `
                                        <div class="text-right">
                                            <p class="text-xs text-gray-500">Submitted on</p>
                                            <p class="text-sm font-medium text-gray-800">${new Date(submission.submittedAt).toLocaleDateString()}</p>
                                            ${submission.grade !== null ? `<p class="text-xs font-bold text-green-600 mt-1">Grade: ${submission.grade}/${a.totalMarks}</p>` : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
                ${assignments.length === 0 ? `<div class="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">No assignments found.</div>` : ''}
            </div>

            <!-- Submit Modal -->
            <div id="submit-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Submit Assignment</h3>
                    <p id="submit-assignment-title" class="text-sm text-gray-500 mb-4"></p>
                    <form id="submit-form">
                        <input type="hidden" name="assignmentId" id="submit-assignment-id">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Your Answer / Link</label>
                            <textarea name="content" required rows="5" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Type your answer here..."></textarea>
                        </div>
                        <div class="mt-6 flex justify-end gap-3">
                            <button type="button" data-action="closeModal" data-id="submit-modal" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('submit-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const assignmentId = fd.get('assignmentId');

            store.submissions.push({
                id: store.generateId(),
                assignmentId: assignmentId,
                studentId: store.currentUser.id,
                content: fd.get('content'),
                submittedAt: new Date().toISOString(),
                grade: null,
                feedback: null
            });
            store.save();
            Utils.closeModal('submit-modal');
            Utils.showToast('Assignment submitted successfully', 'success');
            app.navigate('assignments');
        });
    },

    openSubmitModal(assignmentId) {
        const assignment = store.assignments.find(a => a.id === assignmentId);
        document.getElementById('submit-assignment-id').value = assignmentId;
        document.getElementById('submit-assignment-title').textContent = `Assignment: ${assignment.title} (${assignment.totalMarks} Marks)`;
        Utils.openModal('submit-modal');
    },

    /** Grades table with color-coded percentages */
    renderGrades(container) {
        const user = store.currentUser;
        const mySubmissions = store.submissions.filter(s => s.studentId === user.id && s.grade !== null);

        container.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">My Grades</h2>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Assignment</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Class</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Marks</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Percentage</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Feedback</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${mySubmissions.length === 0 ? `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No grades available yet.</td></tr>` : ''}
                        ${mySubmissions.map(s => {
                            const assignment = store.assignments.find(a => a.id === s.assignmentId);
                            const cls = store.classes.find(c => c.id === assignment.classId);
                            const pct = ((s.grade / assignment.totalMarks) * 100).toFixed(1);
                            let color = 'text-gray-600';
                            if (pct >= 80) color = 'text-green-600';
                            else if (pct >= 50) color = 'text-yellow-600';
                            else color = 'text-red-600';

                            return `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 font-medium text-gray-800">${assignment.title}</td>
                                    <td class="px-6 py-4 text-gray-600">${cls.name}</td>
                                    <td class="px-6 py-4 font-bold ${color}">${s.grade} / ${assignment.totalMarks}</td>
                                    <td class="px-6 py-4 text-gray-600">${pct}%</td>
                                    <td class="px-6 py-4 text-gray-500 text-sm italic">${s.feedback || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /** Compute average percentage across all graded submissions */
    calculateAverageGrade(studentId) {
        const subs = store.submissions.filter(s => s.studentId === studentId && s.grade !== null);
        if (subs.length === 0) return 'N/A';
        const totalPct = subs.reduce((acc, s) => {
            const assignment = store.assignments.find(a => a.id === s.assignmentId);
            return acc + (s.grade / assignment.totalMarks);
        }, 0);
        return ((totalPct / subs.length) * 100).toFixed(1) + '%';
    }
};
