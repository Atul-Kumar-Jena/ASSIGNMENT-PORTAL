/**
 * trainer.js
 * ============================================
 * Trainer Feature Module
 * Dashboard, Class management, Assignment creation, Submission grading.
 */

import { store } from '../core/store.js';
import { Utils } from '../core/utils.js';
import { Shared } from './shared.js';

export const Trainer = {
    renderPage(page, container, app) {
        if (page === 'overview') this.renderOverview(container, app);
        else if (page === 'classes') this.renderClasses(container, app);
        else if (page === 'assignments') this.renderAssignments(container, app);
        else if (page === 'submissions') this.renderSubmissions(container, app);
        else if (page === 'profile') Shared.renderProfile(container, app);
    },

    /** Trainer landing: summary cards + recent activity */
    renderOverview(container, app) {
        const user = store.currentUser;
        const myClasses = store.classes.filter(c => c.trainerId === user.id);
        const myAssignments = store.assignments.filter(a => myClasses.some(c => c.id === a.classId));
        const pendingSubs = store.submissions.filter(s => s.grade === null && myAssignments.some(a => a.id === s.assignmentId));

        container.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Trainer Dashboard</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-blue-100 text-sm font-medium mb-1">My Classes</p>
                            <h3 class="text-3xl font-bold">${myClasses.length}</h3>
                        </div>
                        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><i class="fas fa-school"></i></div>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-purple-100 text-sm font-medium mb-1">Active Assignments</p>
                            <h3 class="text-3xl font-bold">${myAssignments.length}</h3>
                        </div>
                        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><i class="fas fa-tasks"></i></div>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-orange-100 text-sm font-medium mb-1">Pending Grading</p>
                            <h3 class="text-3xl font-bold">${pendingSubs.length}</h3>
                        </div>
                        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><i class="fas fa-clipboard-check"></i></div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 class="font-bold text-gray-800 mb-4">Recent Classes</h3>
                    ${myClasses.slice(0,3).map(c => `
                        <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div>
                                <p class="font-medium text-gray-800">${c.name}</p>
                                <p class="text-xs text-gray-500">${c.students.length} Students Enrolled</p>
                            </div>
                            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-mono">${c.code}</span>
                        </div>
                    `).join('') || '<p class="text-gray-500 text-sm">No classes yet.</p>'}
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 class="font-bold text-gray-800 mb-4">Pending Grading</h3>
                    ${pendingSubs.slice(0,3).map(s => {
                        const student = store.users.find(u => u.id === s.studentId);
                        const assignment = store.assignments.find(a => a.id === s.assignmentId);
                        return `
                            <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <div>
                                    <p class="font-medium text-gray-800">${assignment?.title || 'Unknown'}</p>
                                    <p class="text-xs text-gray-500">by ${student?.name || 'Unknown'}</p>
                                </div>
                                <button data-action="navigate" data-id="submissions" class="text-blue-600 text-xs font-medium hover:underline">Grade</button>
                            </div>
                        `;
                    }).join('') || '<p class="text-gray-500 text-sm">No pending submissions.</p>'}
                </div>
            </div>
        `;
    },

    /** Class grid + create modal + student management modal */
    renderClasses(container, app) {
        const user = store.currentUser;
        const classes = store.classes.filter(c => c.trainerId === user.id);

        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">My Classes</h2>
                <button data-action="openAddClassModal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                    <i class="fas fa-plus"></i> Create Class
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${classes.map(c => `
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div class="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex justify-between items-start">
                            <div class="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-mono tracking-wider">
                                CODE: ${c.code}
                            </div>
                            <button data-action="deleteClass" data-id="${c.id}" class="text-white/80 hover:text-white"><i class="fas fa-trash"></i></button>
                        </div>
                        <div class="p-5">
                            <h3 class="text-lg font-bold text-gray-800 mb-1">${c.name}</h3>
                            <p class="text-sm text-gray-500 mb-4 line-clamp-2">${c.description || 'No description provided.'}</p>
                            <div class="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
                                <span class="flex items-center gap-2"><i class="fas fa-user-graduate text-blue-500"></i> ${c.students.length} Students</span>
                                <button data-action="viewClassStudents" data-id="${c.id}" class="text-blue-600 font-medium hover:underline">Manage</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
                ${classes.length === 0 ? `<div class="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">No classes created yet.</div>` : ''}
            </div>

            <!-- Add Class Modal -->
            <div id="add-class-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Create New Class</h3>
                    <form id="add-class-form">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                                <input type="text" name="name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end gap-3">
                            <button type="button" data-action="closeModal" data-id="add-class-modal" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md">Create Class</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- View Students Modal -->
            <div id="view-students-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 p-6 max-h-[80vh] flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Class Students</h3>
                        <button data-action="closeModal" data-id="view-students-modal" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <div id="students-list-container" class="overflow-y-auto flex-1 space-y-2"></div>
                </div>
            </div>
        `;

        document.getElementById('add-class-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            store.classes.push({
                id: store.generateId(),
                trainerId: store.currentUser.id,
                name: fd.get('name'),
                description: fd.get('description'),
                code: store.generateCode(),
                students: [],
                createdAt: new Date().toISOString()
            });
            store.save();
            Utils.closeModal('add-class-modal');
            Utils.showToast('Class created successfully', 'success');
            app.navigate('classes');
        });
    },

    handleCreateClass(e, app) {
        // Handled inline above for simplicity with dynamic form
    },

    deleteClass(id, app) {
        if (!confirm('Delete this class and all its assignments?')) return;
        store.classes = store.classes.filter(c => c.id !== id);
        store.assignments = store.assignments.filter(a => a.classId !== id);
        store.save();
        Utils.showToast('Class deleted', 'success');
        app.navigate('classes');
    },

    viewClassStudents(classId) {
        const cls = store.classes.find(c => c.id === classId);
        const container = document.getElementById('students-list-container');

        if (cls.students.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-500 py-4">No students enrolled yet.</p>`;
        } else {
            container.innerHTML = cls.students.map(sId => {
                const student = store.users.find(u => u.id === sId);
                return `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">${student.name.charAt(0)}</div>
                            <div>
                                <p class="font-medium text-gray-800">${student.name}</p>
                                <p class="text-xs text-gray-500">${student.email}</p>
                            </div>
                        </div>
                        <button data-action="removeStudentFromClass" data-id="${classId}" data-extra="${sId}" class="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"><i class="fas fa-times"></i></button>
                    </div>
                `;
            }).join('');
        }
        Utils.openModal('view-students-modal');
    },

    removeStudentFromClass(classId, studentId, app) {
        const cls = store.classes.find(c => c.id === classId);
        cls.students = cls.students.filter(id => id !== studentId);
        store.save();
        this.viewClassStudents(classId);
        Utils.showToast('Student removed', 'success');
    },

    /** Assignment list + creation modal */
    renderAssignments(container, app) {
        const user = store.currentUser;
        const classes = store.classes.filter(c => c.trainerId === user.id);
        const assignments = store.assignments.filter(a => classes.some(c => c.id === a.classId));

        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Assignments</h2>
                <button data-action="openAddAssignmentModal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                    <i class="fas fa-plus"></i> New Assignment
                </button>
            </div>

            <div class="space-y-4">
                ${assignments.map(a => {
                    const cls = store.classes.find(c => c.id === a.classId);
                    const dueDate = new Date(a.dueDate);
                    const isExpired = dueDate < new Date();
                    return `
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <h3 class="font-bold text-gray-800">${a.title}</h3>
                                    <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">${cls?.name}</span>
                                    ${isExpired ? '<span class="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Expired</span>' : ''}
                                </div>
                                <p class="text-sm text-gray-500 mb-2">${a.description || 'No description'}</p>
                                <div class="flex items-center gap-4 text-xs text-gray-500">
                                    <span><i class="far fa-calendar-alt mr-1"></i> Due: ${dueDate.toLocaleDateString()}</span>
                                    <span><i class="fas fa-star mr-1"></i> Total Marks: ${a.totalMarks}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button data-action="deleteAssignment" data-id="${a.id}" class="text-red-500 hover:bg-red-50 p-2 rounded transition-colors" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                }).join('')}
                ${assignments.length === 0 ? `<div class="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">No assignments created.</div>` : ''}
            </div>

            <!-- Add Assignment Modal -->
            <div id="add-assignment-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Create Assignment</h3>
                    <form id="add-assignment-form">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                                <select name="classId" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" name="title" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input type="date" name="dueDate" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                                    <input type="number" name="totalMarks" required min="1" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                </div>
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end gap-3">
                            <button type="button" data-action="closeModal" data-id="add-assignment-modal" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('add-assignment-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            store.assignments.push({
                id: store.generateId(),
                classId: fd.get('classId'),
                title: fd.get('title'),
                description: fd.get('description'),
                dueDate: fd.get('dueDate'),
                totalMarks: parseInt(fd.get('totalMarks')),
                createdAt: new Date().toISOString()
            });
            store.save();
            Utils.closeModal('add-assignment-modal');
            Utils.showToast('Assignment created', 'success');
            app.navigate('assignments');
        });
    },

    deleteAssignment(id, app) {
        if (!confirm('Delete this assignment?')) return;
        store.assignments = store.assignments.filter(a => a.id !== id);
        store.submissions = store.submissions.filter(s => s.assignmentId !== id);
        store.save();
        Utils.showToast('Assignment deleted', 'success');
        app.navigate('assignments');
    },

    /** Submission table + grade modal */
    renderSubmissions(container, app) {
        const user = store.currentUser;
        const myClasses = store.classes.filter(c => c.trainerId === user.id);
        const myAssignments = store.assignments.filter(a => myClasses.some(c => c.id === a.classId));
        const submissions = store.submissions.filter(s => myAssignments.some(a => a.id === s.assignmentId));

        container.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Student Submissions</h2>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Student</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Assignment</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${submissions.length === 0 ? `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No submissions yet.</td></tr>` : ''}
                        ${submissions.map(s => {
                            const student = store.users.find(u => u.id === s.studentId);
                            const assignment = store.assignments.find(a => a.id === s.assignmentId);
                            const isGraded = s.grade !== null;
                            return `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 font-medium text-gray-800">${student?.name || 'Unknown'}</td>
                                    <td class="px-6 py-4 text-gray-600">${assignment?.title || 'Unknown'}</td>
                                    <td class="px-6 py-4 text-gray-500 text-sm">${Utils.formatDate(s.submittedAt)}</td>
                                    <td class="px-6 py-4">
                                        ${isGraded 
                                            ? `<span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Graded (${s.grade}/${assignment.totalMarks})</span>`
                                            : `<span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>`
                                        }
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <button data-action="gradeSubmission" data-id="${s.id}" class="text-blue-600 hover:text-blue-800 font-medium text-sm">Review</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Grade Modal -->
            <div id="grade-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Grade Submission</h3>
                    <div id="grade-content" class="mb-6"></div>
                    <form id="grade-form">
                        <input type="hidden" name="submissionId" id="grade-sub-id">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                            <input type="number" name="grade" id="grade-input" required min="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                            <textarea name="feedback" id="grade-feedback" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                        </div>
                        <div class="flex justify-end gap-3">
                            <button type="button" data-action="closeModal" data-id="grade-modal" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md">Save Grade</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('grade-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const subId = document.getElementById('grade-sub-id').value;
            const sub = store.submissions.find(s => s.id === subId);
            const assignment = store.assignments.find(a => a.id === sub.assignmentId);
            const grade = parseInt(new FormData(e.target).get('grade'));

            if (grade > assignment.totalMarks) {
                Utils.showToast(`Grade cannot exceed ${assignment.totalMarks}`, 'error');
                return;
            }

            sub.grade = grade;
            sub.feedback = new FormData(e.target).get('feedback');
            store.save();
            Utils.closeModal('grade-modal');
            Utils.showToast('Grade saved successfully', 'success');
            app.navigate('submissions');
        });
    },

    gradeSubmission(subId) {
        const sub = store.submissions.find(s => s.id === subId);
        const assignment = store.assignments.find(a => a.id === sub.assignmentId);
        const student = store.users.find(u => u.id === sub.studentId);

        document.getElementById('grade-content').innerHTML = `
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
                <p class="text-sm text-gray-500 mb-1">Student: <span class="font-medium text-gray-800">${student.name}</span></p>
                <p class="text-sm text-gray-500 mb-1">Assignment: <span class="font-medium text-gray-800">${assignment.title}</span></p>
                <p class="text-sm text-gray-500">Submission: <span class="font-medium text-gray-800">${sub.content}</span></p>
            </div>
        `;
        document.getElementById('grade-sub-id').value = subId;
        document.getElementById('grade-input').max = assignment.totalMarks;
        if (sub.grade !== null) {
            document.getElementById('grade-input').value = sub.grade;
            document.getElementById('grade-feedback').value = sub.feedback || '';
        } else {
            document.getElementById('grade-input').value = '';
            document.getElementById('grade-feedback').value = '';
        }
        Utils.openModal('grade-modal');
    }
};
