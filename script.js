console.log("script.js loaded successfully");

// -----------------------------------
// Data Storage and Initialization
// -----------------------------------
let users = JSON.parse(localStorage.getItem("users")) || {
    student: { username: "student1", password: "pass123", role: "student", id: "ST001", name: "John Doe", regDetails: "Reg: ST001, Year: 2025", academicInfo: "Form 4, Stream A", gender: "male", form: "4", sponsor: "self" },
    teacher: { username: "teacher1", password: "pass123", role: "teacher", id: "TC001", name: "Jane Smith", dept: "sciences" },
    accountant: { username: "accountant1", password: "pass123", role: "accountant" }
};

let studentData = JSON.parse(localStorage.getItem("studentData")) || {
    ST001: {
        feesPaid: 20000,
        feeStatement: "Premium Statement: Q1 2025",
        events: "Term 1: Jan 10 - Apr 15, Sports Day: Mar 20",
        marks: {
            mathematics: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            english: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            kiswahili: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            chemistry: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            biology: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            physics: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            history: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            geography: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            cre: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            business: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null },
            agriculture: { term1_cat: null, term1_final: null, term2_cat: null, term2_exam: null, term3_exam: null }
        },
        remarks: "Awaiting marks entry."
    }
};

let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
let documents = JSON.parse(localStorage.getItem("documents")) || [];
let auditLog = JSON.parse(localStorage.getItem("auditLog")) || [];

// -----------------------------------
// Local Storage Save Functions
// -----------------------------------
function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

function saveStudentData() {
    console.log("Attempting to save studentData:", studentData);
    try {
        // Merge with existing data to prevent overwriting
        const existingData = JSON.parse(localStorage.getItem("studentData")) || {};
        const mergedData = { ...existingData };
        Object.keys(studentData).forEach(studentId => {
            if (!mergedData[studentId]) {
                mergedData[studentId] = studentData[studentId];
            } else {
                mergedData[studentId] = {
                    ...mergedData[studentId],
                    ...studentData[studentId],
                    marks: {
                        ...mergedData[studentId].marks,
                        ...studentData[studentId].marks
                    }
                };
            }
        });
        localStorage.setItem("studentData", JSON.stringify(mergedData));
        const retrievedData = JSON.parse(localStorage.getItem("studentData"));
        console.log("Successfully saved and retrieved studentData:", retrievedData);
        if (JSON.stringify(mergedData) !== JSON.stringify(retrievedData)) {
            console.error("Mismatch between saved and retrieved studentData!");
            throw new Error("Data mismatch after saving!");
        }
        studentData = retrievedData; // Update in-memory data
    } catch (error) {
        console.error("Error saving studentData to localStorage:", error);
        throw error;
    }
}

function saveAnnouncements() {
    localStorage.setItem("announcements", JSON.stringify(announcements));
}

function saveDocuments() {
    localStorage.setItem("documents", JSON.stringify(documents));
}

function saveAuditLog() {
    localStorage.setItem("auditLog", JSON.stringify(auditLog));
}

// -----------------------------------
// Utility Functions
// -----------------------------------
function showError(message) {
    const errorDiv = document.getElementById("error");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("hidden");
        setTimeout(() => errorDiv.classList.add("hidden"), 3000);
    }
}

function showSuccess(message) {
    const successDiv = document.querySelector(".success-message");
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.remove("hidden");
        setTimeout(() => successDiv.classList.add("hidden"), 3000);
    }
}

// KNEC Grading System
function getKnecGrade(mark) {
    if (mark >= 80) return "A";
    if (mark >= 75) return "A-";
    if (mark >= 70) return "B+";
    if (mark >= 65) return "B";
    if (mark >= 60) return "B-";
    if (mark >= 55) return "C+";
    if (mark >= 50) return "C";
    if (mark >= 45) return "C-";
    if (mark >= 40) return "D+";
    if (mark >= 35) return "D";
    if (mark >= 30) return "D-";
    return "E";
}

// Section Visibility Toggle
function setupSectionVisibility(sections) {
    document.querySelectorAll(".sidebar a").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute("href").substring(1);
            sections.forEach(section => {
                section.classList.toggle("hidden", section.id !== targetSection);
            });
            document.querySelectorAll(".sidebar a").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });
}

// -----------------------------------
// Authentication Functions
// -----------------------------------
function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const user = Object.values(users).find(u => u.username === username && u.password === password && u.role === role);

    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        auditLog.push({ action: `Login by ${user.role} (${user.username})`, timestamp: new Date().toISOString() });
        saveAuditLog();
        window.location.href = `${role}.html`;
    } else {
        showError("Invalid credentials");
    }
}

function studentRegister(event) {
    event.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const regNo = document.getElementById("regNo").value.trim().toUpperCase();
    const gender = document.getElementById("regGender").value;
    const form = document.getElementById("regForm").value;
    const sponsor = document.getElementById("regSponsor").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    if (!name || !regNo || !gender || !form || !sponsor || !password) {
        showError("All fields are required");
        return;
    }

    if (password.length < 6) {
        showError("Password must be at least 6 characters");
        return;
    }

    if (password !== confirmPassword) {
        showError("Passwords do not match");
        return;
    }

    if (Object.values(users).some(u => u.id === regNo || u.username === regNo)) {
        showError("Registration number or username already exists");
        return;
    }

    const newStudent = {
        username: regNo,
        password: password,
        role: "student",
        id: regNo,
        name: name,
        regDetails: `Reg: ${regNo}, Year: 2025`,
        academicInfo: `Form ${form}, Stream A`,
        gender: gender,
        form: form,
        sponsor: sponsor
    };

    const subjects = [
        "mathematics", "english", "kiswahili", "chemistry", "biology",
        "physics", "history", "geography", "cre", "business", "agriculture"
    ];
    const terms = ["term1_cat", "term1_final", "term2_cat", "term2_exam", "term3_exam"];
    const marks = {};
    subjects.forEach(subject => {
        marks[subject] = {};
        terms.forEach(term => {
            marks[subject][term] = null;
        });
    });

    studentData[regNo] = {
        feesPaid: 0,
        feeStatement: "No payments yet",
        events: "Term 1: Jan 10 - Apr 15, Sports Day: Mar 20",
        marks: marks,
        remarks: "Awaiting marks entry."
    };

    users[regNo] = newStudent;
    auditLog.push({ action: `Student registered: ${regNo}`, timestamp: new Date().toISOString() });
    saveUsers();
    saveStudentData();
    saveAuditLog();
    showSuccess("Registration successful! Please login.");
    document.getElementById("studentRegisterForm").reset();
    document.getElementById("studentRegisterForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

function teacherRegister(event) {
    event.preventDefault();
    const name = document.getElementById("teacherRegName").value.trim();
    const teacherId = document.getElementById("teacherRegId").value.trim().toUpperCase();
    const dept = document.getElementById("teacherRegDept").value;
    const password = document.getElementById("teacherRegPassword").value;
    const confirmPassword = document.getElementById("teacherRegConfirmPassword").value;

    if (!name || !teacherId || !dept || !password) {
        showError("All fields are required");
        return;
    }

    if (password.length < 6) {
        showError("Password must be at least 6 characters");
        return;
    }

    if (password !== confirmPassword) {
        showError("Passwords do not match");
        return;
    }

    if (Object.values(users).some(u => u.id === teacherId || u.username === teacherId)) {
        showError("Teacher ID or username already exists");
        return;
    }

    const newTeacher = {
        username: teacherId,
        password: password,
        role: "teacher",
        id: teacherId,
        name: name,
        dept: dept
    };

    users[teacherId] = newTeacher;
    auditLog.push({ action: `Teacher registered: ${teacherId}`, timestamp: new Date().toISOString() });
    saveUsers();
    saveAuditLog();
    showSuccess("Registration successful! Please login.");
    document.getElementById("teacherRegisterForm").reset();
    document.getElementById("teacherRegisterForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

function logout() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        auditLog.push({ action: `Logout by ${user.role} (${user.username})`, timestamp: new Date().toISOString() });
        saveAuditLog();
    }
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// -----------------------------------
// Student Portal Functions
// -----------------------------------
function loadStudentPortal() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "student") {
        window.location.href = "index.html";
        return;
    }

    // Log raw localStorage data for debugging
    const rawStudentData = localStorage.getItem("studentData");
    console.log("Student Portal - Raw studentData from localStorage:", rawStudentData);

    // Force reload studentData from localStorage to ensure latest data
    let freshStudentData = JSON.parse(rawStudentData);
    if (freshStudentData && freshStudentData[user.id]) {
        // Check if marks structure is valid; if not, reset to default
        const hasValidMarks = freshStudentData[user.id].marks && Object.keys(freshStudentData[user.id].marks).length > 0;
        if (!hasValidMarks) {
            console.warn("Student Portal - Invalid or missing marks data, resetting to default.");
            freshStudentData[user.id].marks = studentData[user.id].marks;
            localStorage.setItem("studentData", JSON.stringify(freshStudentData));
        }
        studentData = freshStudentData;
        console.log("Student Portal - Fetched fresh studentData from localStorage:", studentData);
    } else {
        console.error("Student Portal - No studentData found in localStorage, using in-memory data:", studentData);
        localStorage.setItem("studentData", JSON.stringify(studentData));
    }

    const data = studentData[user.id];
    if (!data) {
        console.error(`Student Portal - No data found for student ${user.id}`);
        showError("Unable to load student data. Please contact support.");
        return;
    }
    console.log(`Student Portal - Loaded data for student ${user.id}:`, data);

    const sections = document.querySelectorAll(".portal-main section");
    setupSectionVisibility(sections);

    document.getElementById("studentName").textContent = `Name: ${user.name}`;
    document.getElementById("regDetails").textContent = `${user.regDetails}, Gender: ${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}, Form: ${user.form}, Sponsor: ${user.sponsor.charAt(0).toUpperCase() + user.sponsor.slice(1)}`;
    document.getElementById("academicInfo").textContent = user.academicInfo;

    // Dashboard Section
    const totalFees = 44000;
    document.getElementById("dashBalance").textContent = data.feesPaid > totalFees 
        ? `0 KES (Overpaid: ${data.feesPaid - totalFees} KES)`
        : `${totalFees - data.feesPaid} KES`;
    const studentAnnouncements = announcements.filter(a => 
        (a.recipient === "students" || a.recipient === "all" || (a.recipient === user.id && a.type === "individual"))
    );
    let unreadCount = studentAnnouncements.filter(a => !a.readBy?.includes(user.id)).length;
    document.getElementById("unreadAnnouncements").textContent = unreadCount;
    let gradesCount = 0;
    Object.values(data.marks).forEach(subject => {
        Object.values(subject).forEach(mark => {
            if (mark !== null) gradesCount++;
        });
    });
    document.getElementById("gradesEntered").textContent = gradesCount;
    document.getElementById("dashEvents").textContent = data.events.split(",")[0];

    // Fees Section
    document.getElementById("feesPaid").textContent = `Fees Paid: ${data.feesPaid} KES`;
    document.getElementById("balance").textContent = data.feesPaid > totalFees 
        ? `Balance: 0 KES`
        : `Balance: ${totalFees - data.feesPaid} KES`;
    document.getElementById("overpayment").textContent = data.feesPaid > totalFees 
        ? `Overpayment: ${data.feesPaid - totalFees} KES`
        : "";
    document.getElementById("overpayment").classList.toggle("hidden", !(data.feesPaid > totalFees));
    document.getElementById("feeStatement").textContent = data.feeStatement;

    // Events
    document.getElementById("eventsContent").textContent = data.events;

    // Academic Performance (Marks in Table)
    const marksTableBodies = document.querySelectorAll("#marksTableBody");
    let total = 0, count = 0;
    marksTableBodies.forEach(marksTableBody => {
        marksTableBody.innerHTML = "";
        console.log(`Rendering marks table for student ${user.id}`);
        Object.keys(data.marks).forEach(subject => {
            const terms = data.marks[subject];
            console.log(`Rendering marks for ${subject}:`, terms);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${subject.charAt(0).toUpperCase() + subject.slice(1)}</td>
                <td>${terms.term1_cat !== null ? `${terms.term1_cat} (${getKnecGrade(terms.term1_cat)})` : "Not yet graded"}</td>
                <td>${terms.term1_final !== null ? `${terms.term1_final} (${getKnecGrade(terms.term1_final)})` : "Not yet graded"}</td>
                <td>${terms.term2_cat !== null ? `${terms.term2_cat} (${getKnecGrade(terms.term2_cat)})` : "Not yet graded"}</td>
                <td>${terms.term2_exam !== null ? `${terms.term2_exam} (${getKnecGrade(terms.term2_exam)})` : "Not yet graded"}</td>
                <td>${terms.term3_exam !== null ? `${terms.term3_exam} (${getKnecGrade(terms.term3_exam)})` : "Not yet graded"}</td>
            `;
            marksTableBody.appendChild(row);
            Object.values(terms).forEach(mark => {
                if (mark !== null) {
                    total += mark;
                    count++;
                }
            });
        });
    });
    document.getElementById("totalMarks").textContent = count >= 8 
        ? `Total Marks: ${total}`
        : `Total Marks: Awaiting more grades (${count}/8 required)`;
    document.getElementById("remarks").textContent = data.remarks;

    // Announcements
    const announcementsDiv = document.getElementById("announcementsList");
    announcementsDiv.innerHTML = studentAnnouncements.length ? "" : "<p>No announcements available.</p>";
    studentAnnouncements.forEach(a => {
        const isRead = a.readBy?.includes(user.id) ? "read" : "unread";
        announcementsDiv.innerHTML += `
            <div class="${isRead}">
                <p><strong>${a.sender} (${a.role.charAt(0).toUpperCase() + a.role.slice(1)})</strong></p>
                <p>${a.message}</p>
                <p style="font-size: 0.9rem; color: #666;">${new Date(a.timestamp).toLocaleString()}</p>
                ${!a.readBy?.includes(user.id) ? `<button class="mark-read" data-id="${a.id}">Mark as Read</button>` : ""}
            </div>
        `;
    });

    document.querySelectorAll(".mark-read").forEach(btn => {
        btn.addEventListener("click", () => {
            const announcementId = btn.dataset.id;
            const announcement = announcements.find(a => a.id === announcementId);
            if (!announcement.readBy) announcement.readBy = [];
            if (!announcement.readBy.includes(user.id)) {
                announcement.readBy.push(user.id);
                saveAnnouncements();
                showSuccess("Announcement marked as read!");
                loadStudentPortal();
            }
        });
    });

    // Documents
    const documentList = document.getElementById("documentList");
    documentList.innerHTML = documents.length ? "" : "<p>No documents available.</p>";
    documents.forEach(d => {
        documentList.innerHTML += `
            <div>
                <p>${d.name} (Uploaded by ${d.uploader}, ${d.role.charAt(0).toUpperCase() + d.role.slice(1)} on ${new Date(d.timestamp).toLocaleString()})</p>
                <a href="${d.data}" download="${d.name}">Download</a>
            </div>
        `;
    });

    // Profile Editing
    document.getElementById("editProfile").addEventListener("click", () => {
        const newName = prompt("Enter new name:", user.name);
        const newPassword = prompt("Enter new password (leave blank to keep current):");
        const newGender = prompt("Enter new gender (male/female):", user.gender);
        if (newName && newGender && ["male", "female"].includes(newGender.toLowerCase())) {
            users[user.id].name = newName.trim();
            users[user.id].gender = newGender.toLowerCase();
            if (newPassword && newPassword.length >= 6) {
                users[user.id].password = newPassword;
            } else if (newPassword) {
                showError("Password must be at least 6 characters!");
                return;
            }
            auditLog.push({ action: `Profile updated by student ${user.id}`, timestamp: new Date().toISOString() });
            saveUsers();
            saveAuditLog();
            showSuccess("Profile updated successfully!");
            loadStudentPortal();
        } else {
            showError("Invalid name or gender (must be male/female)!");
        }
    });

    // Update Form
    const updateFormSelect = document.getElementById("updateForm");
    updateFormSelect.value = user.form;
    document.getElementById("updateFormBtn").addEventListener("click", () => {
        const newForm = updateFormSelect.value;
        users[user.id].form = newForm;
        users[user.id].academicInfo = `Form ${newForm}, Stream A`;
        auditLog.push({ action: `Form updated by student ${user.id} to Form ${newForm}`, timestamp: new Date().toISOString() });
        saveUsers();
        saveAuditLog();
        showSuccess(`Form updated to Form ${newForm} successfully!`);
        loadStudentPortal();
    });
}

// -----------------------------------
// Teacher Portal Functions
// -----------------------------------
function loadTeacherPortal() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "teacher") {
        window.location.href = "index.html";
        return;
    }

    const sections = document.querySelectorAll(".portal-main section");
    setupSectionVisibility(sections);

    // Dashboard
    const totalStudents = Object.values(users).filter(u => u.role === "student").length;
    const teacherAnnouncements = announcements.filter(a => a.senderId === user.id).length;
    const teacherDocuments = documents.filter(d => d.uploaderId === user.id).length;
    document.getElementById("totalStudents").textContent = totalStudents;
    document.getElementById("totalAnnouncements").textContent = teacherAnnouncements;
    document.getElementById("totalDocuments").textContent = teacherDocuments;

    // Student List for Marks Entry
    const studentList = document.getElementById("studentList");
    const searchStudent = document.getElementById("searchStudent");
    const students = Object.values(users).filter(u => u.role === "student");
    function renderStudentList(filter = "") {
        studentList.innerHTML = "";
        students.filter(s => s.id.toLowerCase().includes(filter.toLowerCase()) || s.name.toLowerCase().includes(filter.toLowerCase())).forEach(s => {
            studentList.innerHTML += `<div data-id="${s.id}">${s.name} (${s.id})</div>`;
        });
        document.querySelectorAll("#studentList div").forEach(div => {
            div.addEventListener("click", () => {
                document.getElementById("studentId").value = div.dataset.id;
            });
        });
    }
    renderStudentList();
    searchStudent.addEventListener("input", () => renderStudentList(searchStudent.value));

    // Subjects Dropdown for Marks Entry
    const subjectSelect = document.getElementById("subject");
    if (subjectSelect) {
        subjectSelect.innerHTML = "<option value=''>Select a subject</option>";
        const subjects = [
            "mathematics", "english", "kiswahili", "chemistry", "biology",
            "physics", "history", "geography", "cre", "business", "agriculture"
        ];
        subjects.forEach(subject => {
            subjectSelect.innerHTML += `<option value="${subject}">${subject.charAt(0).toUpperCase() + subject.slice(1)}</option>`;
        });
    }

    // Marks Form Submission
    document.getElementById("marksForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const studentId = document.getElementById("studentId").value.trim().toUpperCase();
        const subject = document.getElementById("subject").value;
        const term = document.getElementById("term").value;
        const marks = parseInt(document.getElementById("marks").value);
        const remarks = document.getElementById("remarks").value.trim();

        console.log("Marks Form Submission:", { studentId, subject, term, marks, remarks });

        if (!studentId || !studentData[studentId]) {
            showError("Please select a valid student!");
            return;
        }
        if (!subject || !term) {
            showError("Please select a subject and term!");
            return;
        }
        if (isNaN(marks) || marks < 0 || marks > 100) {
            showError("Marks must be between 0 and 100.");
            return;
        }

        try {
            console.log(`Before update - studentData[${studentId}].marks[${subject}][${term}]:`, studentData[studentId].marks[subject][term]);
            studentData[studentId].marks[subject][term] = marks;
            if (remarks) studentData[studentId].remarks = remarks;
            console.log(`After update - studentData[${studentId}].marks[${subject}][${term}]:`, studentData[studentId].marks[subject][term]);

            saveStudentData();

            const updatedData = JSON.parse(localStorage.getItem("studentData"));
            console.log(`Retrieved updatedData[${studentId}].marks[${subject}][${term}]:`, updatedData[studentId].marks[subject][term]);
            console.log(`Comparing saved marks (${marks}) with retrieved marks (${updatedData[studentId].marks[subject][term]})`);

            if (updatedData[studentId].marks[subject][term] === marks) {
                auditLog.push({ action: `Marks updated for ${studentId} in ${subject} (${term}) by ${user.id}`, timestamp: new Date().toISOString() });
                saveAuditLog();
                showSuccess(`Marks for ${subject} (${term}) updated successfully for student ${studentId}!`);
                console.log("Success prompt shown - marks confirmed saved.");
                document.getElementById("marksForm").reset();
                document.getElementById("studentId").value = "";
            } else {
                console.error("Data mismatch - marks not saved correctly!");
                showError("Failed to save marks - data mismatch!");
            }
        } catch (error) {
            console.error("Error during marks submission:", error);
            showError("Failed to save marks. Please try again.");
        }
    });

    // Edit Marks Section
    const editStudentList = document.getElementById("editStudentList");
    const editSearchStudent = document.getElementById("editSearchStudent");
    function renderEditStudentList(filter = "") {
        editStudentList.innerHTML = "";
        students.filter(s => s.id.toLowerCase().includes(filter.toLowerCase()) || s.name.toLowerCase().includes(filter.toLowerCase())).forEach(s => {
            editStudentList.innerHTML += `<div data-id="${s.id}">${s.name} (${s.id})</div>`;
        });
        document.querySelectorAll("#editStudentList div").forEach(div => {
            div.addEventListener("click", () => {
                const studentId = div.dataset.id;
                document.getElementById("editStudentId").value = studentId;
                const editSubjectSelect = document.getElementById("editSubject");
                editSubjectSelect.innerHTML = "<option value=''>Select a subject</option>";
                const subjects = [
                    "mathematics", "english", "kiswahili", "chemistry", "biology",
                    "physics", "history", "geography", "cre", "business", "agriculture"
                ];
                subjects.forEach(subject => {
                    editSubjectSelect.innerHTML += `<option value="${subject}">${subject.charAt(0).toUpperCase() + subject.slice(1)}</option>`;
                });
                editSubjectSelect.addEventListener("change", () => {
                    const selectedSubject = editSubjectSelect.value;
                    const selectedTerm = document.getElementById("editTerm").value;
                    if (selectedSubject && selectedTerm) {
                        const currentMarks = studentData[studentId].marks[selectedSubject][selectedTerm];
                        document.getElementById("editMarks").value = currentMarks !== null ? currentMarks : "";
                        document.getElementById("editRemarks").value = studentData[studentId].remarks;
                    }
                });
                document.getElementById("editTerm").addEventListener("change", () => {
                    const selectedSubject = editSubjectSelect.value;
                    const selectedTerm = document.getElementById("editTerm").value;
                    if (selectedSubject && selectedTerm) {
                        const currentMarks = studentData[studentId].marks[selectedSubject][selectedTerm];
                        document.getElementById("editMarks").value = currentMarks !== null ? currentMarks : "";
                    }
                });
            });
        });
    }
    renderEditStudentList();
    editSearchStudent.addEventListener("input", () => renderEditStudentList(editSearchStudent.value));

    document.getElementById("editMarksForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const studentId = document.getElementById("editStudentId").value.trim().toUpperCase();
        const subject = document.getElementById("editSubject").value;
        const term = document.getElementById("editTerm").value;
        const marks = parseInt(document.getElementById("editMarks").value);
        const remarks = document.getElementById("editRemarks").value.trim();

        if (!studentId || !studentData[studentId]) {
            showError("Please select a valid student!");
            return;
        }
        if (!subject || !term) {
            showError("Please select a subject and term!");
            return;
        }
        if (isNaN(marks) || marks < 0 || marks > 100) {
            showError("Marks must be between 0 and 100.");
            return;
        }

        try {
            studentData[studentId].marks[subject][term] = marks;
            if (remarks) studentData[studentId].remarks = remarks;
            saveStudentData();

            const updatedData = JSON.parse(localStorage.getItem("studentData"));
            if (updatedData[studentId].marks[subject][term] === marks) {
                auditLog.push({ action: `Marks corrected for ${studentId} in ${subject} (${term}) by ${user.id}`, timestamp: new Date().toISOString() });
                saveAuditLog();
                showSuccess(`Marks for ${subject} (${term}) corrected successfully for student ${studentId}!`);
                document.getElementById("editMarksForm").reset();
                document.getElementById("editStudentId").value = "";
            } else {
                showError("Failed to save corrected marks - data mismatch!");
            }
        } catch (error) {
            console.error("Error during marks correction:", error);
            showError("Failed to save corrected marks. Please try again.");
        }
    });

    // Announcements
    const announcementForm = document.getElementById("announcementForm");
    const announcementType = document.getElementById("announcementType");
    const studentSelectDiv = document.getElementById("studentSelectDiv");
    const announcementStudent = document.getElementById("announcementStudent");
    announcementType.addEventListener("change", () => {
        studentSelectDiv.classList.toggle("hidden", announcementType.value !== "individual");
        if (announcementType.value === "individual") {
            announcementStudent.innerHTML = "";
            students.forEach(s => {
                announcementStudent.innerHTML += `<option value="${s.id}">${s.name} (${s.id})</option>`;
            });
        }
    });
    announcementForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const type = announcementType.value;
        const recipient = type === "individual" ? announcementStudent.value : "students";
        const message = document.getElementById("announcementMessage").value;
        if (!message) {
            showError("Announcement message is required!");
            return;
        }
        const announcement = {
            id: Date.now().toString(),
            type: type,
            recipient: recipient,
            message: message,
            sender: user.name,
            senderId: user.id,
            role: user.role,
            timestamp: new Date().toISOString(),
            readBy: []
        };
        announcements.push(announcement);
        auditLog.push({ action: `Announcement posted by ${user.id} to ${recipient}`, timestamp: new Date().toISOString() });
        saveAnnouncements();
        saveAuditLog();
        showSuccess("Announcement posted successfully!");
        announcementForm.reset();
        studentSelectDiv.classList.add("hidden");
        loadTeacherPortal();
    });

    // Document Upload
    const documentForm = document.getElementById("documentForm");
    const documentList = document.getElementById("documentList");
    documentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const documentName = document.getElementById("documentName").value.trim();
        const file = document.getElementById("documentFile").files[0];
        if (!documentName || !file) {
            showError("Document name and file are required!");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            documents.push({
                id: Date.now().toString(),
                name: documentName,
                data: reader.result,
                uploader: user.name,
                uploaderId: user.id,
                role: user.role,
                timestamp: new Date().toISOString()
            });
            auditLog.push({ action: `Document uploaded by ${user.id}: ${documentName}`, timestamp: new Date().toISOString() });
            saveDocuments();
            saveAuditLog();
            showSuccess("Document uploaded successfully!");
            documentForm.reset();
            loadTeacherPortal();
        };
        reader.readAsDataURL(file);
    });
    if (user) {
        documentList.innerHTML = documents.filter(d => d.uploaderId === user.id).length ? "" : "<p>No documents uploaded.</p>";
        documents.filter(d => d.uploaderId === user.id).forEach(d => {
            documentList.innerHTML += `
                <div>
                    <p>${d.name} (Uploaded: ${new Date(d.timestamp).toLocaleString()})</p>
                    <a href="${d.data}" download="${d.name}">Download</a>
                </div>
            `;
        });
    }
}

// -----------------------------------
// Accountant Portal Functions
// -----------------------------------
function loadAccountantPortal() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "accountant") {
        window.location.href = "index.html";
        return;
    }

    const sections = document.querySelectorAll(".portal-main section");
    setupSectionVisibility(sections);

    // Dashboard
    const totalStudents = Object.values(users).filter(u => u.role === "student").length;
    const totalFees = Object.values(studentData).reduce((sum, s) => sum + s.feesPaid, 0);
    const accountantAnnouncements = announcements.filter(a => a.senderId === user.id).length;
    document.getElementById("totalStudents").textContent = totalStudents;
    document.getElementById("totalFees").textContent = `${totalFees} KES`;
    document.getElementById("totalAnnouncements").textContent = accountantAnnouncements;

    // Fee Management
    document.getElementById("searchForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const searchInput = document.getElementById("searchInput").value.trim();
        const student = Object.values(users).find(u => u.role === "student" && (u.id === searchInput.toUpperCase() || u.name.toLowerCase().includes(searchInput.toLowerCase())));
        
        if (student && studentData[student.id]) {
            const data = studentData[student.id];
            const totalFees = 44000;
            const balance = data.feesPaid > totalFees ? 0 : totalFees - data.feesPaid;
            const overpayment = data.feesPaid > totalFees ? data.feesPaid - totalFees : 0;
            document.getElementById("studentInfo").textContent = `Name: ${student.name}, ID: ${student.id}, Fees Paid: ${data.feesPaid} KES, Balance: ${balance} KES${overpayment > 0 ? `, Overpayment: ${overpayment} KES` : ""}`;
            document.getElementById("studentDetails").classList.remove("hidden");
            localStorage.setItem("currentStudentId", student.id);
        } else {
            showError("Student not found! Please use a valid student ID (e.g., ST001) or name.");
            document.getElementById("studentDetails").classList.add("hidden");
        }
    });

    document.getElementById("feeForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const paymentAmount = parseInt(document.getElementById("paymentAmount").value);
        const paymentMethod = document.getElementById("paymentMethod").value;
        const studentId = localStorage.getItem("currentStudentId");

        if (!studentId || !studentData[studentId]) {
            showError("No student selected! Please search for a student first.");
            return;
        }

        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            showError("Payment amount must be positive!");
            return;
        }

        studentData[studentId].feesPaid += paymentAmount;
        studentData[studentId].feeStatement = `Premium Statement: Updated via ${paymentMethod} on ${new Date().toLocaleDateString()}`;
        auditLog.push({ action: `Payment of ${paymentAmount} KES updated for ${studentId} by ${user.id}`, timestamp: new Date().toISOString() });
        saveStudentData();
        saveAuditLog();
        showSuccess(`Payment of ${paymentAmount} KES updated successfully for student ${studentId}!`);
        document.getElementById("feeForm").reset();
        document.getElementById("studentDetails").classList.add("hidden");
        localStorage.removeItem("currentStudentId");
        loadAccountantPortal();
    });

    // Fee Correction
    document.getElementById("correctFees").addEventListener("click", () => {
        document.getElementById("correctFeeForm").classList.toggle("hidden");
    });

    document.getElementById("correctFeeForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const correctedAmount = parseInt(document.getElementById("correctedAmount").value);
        const studentId = localStorage.getItem("currentStudentId");

        if (!studentId || !studentData[studentId]) {
            showError("No student selected! Please search for a student first.");
            return;
        }

        if (isNaN(correctedAmount) || correctedAmount < 0) {
            showError("Corrected amount cannot be negative!");
            return;
        }

        studentData[studentId].feesPaid = correctedAmount;
        studentData[studentId].feeStatement = `Premium Statement: Corrected on ${new Date().toLocaleDateString()}`;
        auditLog.push({ action: `Fees corrected to ${correctedAmount} KES for ${studentId} by ${user.id}`, timestamp: new Date().toISOString() });
        saveStudentData();
        saveAuditLog();
        showSuccess(`Fees corrected to ${correctedAmount} KES for student ${studentId}!`);
        document.getElementById("correctFeeForm").reset();
        document.getElementById("correctFeeForm").classList.add("hidden");
        document.getElementById("studentDetails").classList.add("hidden");
        localStorage.removeItem("currentStudentId");
        loadAccountantPortal();
    });

    // Announcements
    const announcementForm = document.getElementById("accountantAnnouncementForm");
    const announcementRecipient = document.getElementById("announcementRecipient");
    const studentSelectDiv = document.getElementById("studentSelectDiv");
    const announcementStudent = document.getElementById("announcementStudent");
    const students = Object.values(users).filter(u => u.role === "student");
    announcementRecipient.addEventListener("change", () => {
        studentSelectDiv.classList.toggle("hidden", announcementRecipient.value !== "individual_student");
        if (announcementRecipient.value === "individual_student") {
            announcementStudent.innerHTML = "";
            students.forEach(s => {
                announcementStudent.innerHTML += `<option value="${s.id}">${s.name} (${s.id})</option>`;
            });
        }
    });
    announcementForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const recipient = announcementRecipient.value === "individual_student" ? announcementStudent.value : announcementRecipient.value;
        const message = document.getElementById("announcementMessage").value;
        if (!message) {
            showError("Announcement message is required!");
            return;
        }
        const announcement = {
            id: Date.now().toString(),
            type: recipient === "individual_student" ? "individual" : "general",
            recipient: recipient === "individual_student" ? announcementStudent.value : recipient,
            message: message,
            sender: user.name,
            senderId: user.id,
            role: user.role,
            timestamp: new Date().toISOString(),
            readBy: []
        };
        announcements.push(announcement);
        auditLog.push({ action: `Announcement posted by ${user.id} to ${recipient}`, timestamp: new Date().toISOString() });
        saveAnnouncements();
        saveAuditLog();
        showSuccess("Announcement posted successfully!");
        announcementForm.reset();
        studentSelectDiv.classList.add("hidden");
        loadAccountantPortal();
    });

    // Document Upload
    const documentForm = document.getElementById("documentForm");
    const documentList = document.getElementById("documentList");
    documentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const documentName = document.getElementById("documentName").value.trim();
        const file = document.getElementById("documentFile").files[0];
        if (!documentName || !file) {
            showError("Document name and file are required!");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            documents.push({
                id: Date.now().toString(),
                name: documentName,
                data: reader.result,
                uploader: user.name,
                uploaderId: user.id,
                role: user.role,
                timestamp: new Date().toISOString()
            });
            auditLog.push({ action: `Document uploaded by ${user.id}: ${documentName}`, timestamp: new Date().toISOString() });
            saveDocuments();
            saveAuditLog();
            showSuccess("Document uploaded successfully!");
            documentForm.reset();
            loadAccountantPortal();
        };
        reader.readAsDataURL(file);
    });
    if (user) {
        documentList.innerHTML = documents.filter(d => d.uploaderId === user.id).length ? "" : "<p>No documents uploaded.</p>";
        documents.filter(d => d.uploaderId === user.id).forEach(d => {
            documentList.innerHTML += `
                <div>
                    <p>${d.name} (Uploaded: ${new Date(d.timestamp).toLocaleString()})</p>
                    <a href="${d.data}" download="${d.name}">Download</a>
                </div>
            `;
        });
    }
}

// -----------------------------------
// Event Listeners for Index Page
// -----------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const showLoginBtn = document.getElementById("showLogin");
    const showStudentRegisterBtn = document.getElementById("showStudentRegister");
    const showTeacherRegisterBtn = document.getElementById("showTeacherRegister");
    const loginForm = document.getElementById("loginForm");
    const studentRegisterForm = document.getElementById("studentRegisterForm");
    const teacherRegisterForm = document.getElementById("teacherRegisterForm");

    if (showLoginBtn && showStudentRegisterBtn && showTeacherRegisterBtn && loginForm && studentRegisterForm && teacherRegisterForm) {
        showLoginBtn.addEventListener("click", () => {
            loginForm.classList.remove("hidden");
            studentRegisterForm.classList.add("hidden");
            teacherRegisterForm.classList.add("hidden");
        });

        showStudentRegisterBtn.addEventListener("click", () => {
            loginForm.classList.add("hidden");
            studentRegisterForm.classList.remove("hidden");
            teacherRegisterForm.classList.add("hidden");
        });

        showTeacherRegisterBtn.addEventListener("click", () => {
            loginForm.classList.add("hidden");
            studentRegisterForm.classList.add("hidden");
            teacherRegisterForm.classList.remove("hidden");
        });

        loginForm.addEventListener("submit", login);
        studentRegisterForm.addEventListener("submit", studentRegister);
        teacherRegisterForm.addEventListener("submit", teacherRegister);
    }
});

// Logout Button
if (document.getElementById("logout")) {
    document.getElementById("logout").addEventListener("click", logout);
}

// Load Portals Based on Current Page
if (window.location.pathname.includes("student.html")) {
    loadStudentPortal();
}

if (window.location.pathname.includes("teacher.html")) {
    loadTeacherPortal();
}

if (window.location.pathname.includes("accountant.html")) {
    loadAccountantPortal();
}