document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const dob = document.getElementById('dob').value;
    const className = document.getElementById('class').value.trim();
    const score = document.getElementById('score').value;
    const major = document.getElementById('major').value.trim();

    if (window.editingStudent) {
        // Cập nhật sinh viên
        fetch(`http://localhost:5000/update_student/${studentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, dob, class: className, score, major })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('studentForm').reset();
                document.getElementById('studentId').disabled = false;
                document.querySelector('#studentForm button[type="submit"]').textContent = "Thêm sinh viên";
                window.editingStudent = false;
                loadStudents();
            } else {
                alert('Cập nhật thất bại!');
            }
        });
    } else {
        // Thêm sinh viên mới
        if (name && studentId && dob && className && score && major) {
            fetch('http://localhost:5000/add_student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    studentId: studentId,
                    dob: dob,
                    class: className,
                    score: score,
                    major: major
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('studentForm').reset();
                    loadStudents(); // cập nhật lại danh sách
                } else {
                    alert('Lỗi khi thêm sinh viên!');
                }
            })
            .catch(err => {
                console.error('Lỗi:', err);
                alert('Đã xảy ra lỗi kết nối!');
            });
        } else {
            alert('Vui lòng nhập đầy đủ thông tin!');
        }
    }
});
let studentsData = [];
let currentSort = { key: '', asc: true };
function loadStudents() {
    fetch('http://localhost:5000/students')
        .then(res => res.json())
        .then(data => {
            studentsData = data;
            renderStudents(studentsData);
        });
}

function renderStudents(data) {
    const table = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    data.forEach(sv => {
        const newRow = table.insertRow();
        newRow.insertCell(0).textContent = sv.studentId;
        newRow.insertCell(1).textContent = sv.name;
        newRow.insertCell(2).textContent = sv.dob;
        newRow.insertCell(3).textContent = sv.class;
        newRow.insertCell(4).textContent = sv.score;
        newRow.insertCell(5).textContent = sv.major;
        const sx = newRow.insertCell(6);
        sx.innerHTML = `
            <button onclick="openEditModal('${sv.studentId}')">Sửa</button>
            <button onclick="deleteStudent('${sv.studentId}')">Xóa</button>`;
    });
}
function sortStudents(key) {
    if (currentSort.key === key) {
        currentSort.asc = !currentSort.asc;
    } else {
        currentSort.key = key;
        currentSort.asc = true;
    }
    let sorted = [...studentsData];
    sorted.sort((a, b) => {
        if (key === 'score') {
            return currentSort.asc ? a[key] - b[key] : b[key] - a[key];
        }
        if (a[key] < b[key]) return currentSort.asc ? -1 : 1;
        if (a[key] > b[key]) return currentSort.asc ? 1 : -1;
        return 0;
    });
    renderStudents(sorted);
}
function editStudent(studentId) {
    fetch(`http://localhost:5000/student/${studentId}`)
        .then(res => res.json())
        .then(sv => {
            document.getElementById('name').value = sv.name;
            document.getElementById('studentId').value = sv.studentId;
            document.getElementById('dob').value = sv.dob;
            document.getElementById('class').value = sv.class;
            document.getElementById('score').value = sv.score;
            document.getElementById('major').value = sv.major;
            // Disable mã SV để tránh sửa mã
            document.getElementById('studentId').disabled = true;
            // Đổi nút submit thành "Cập nhật"
            document.querySelector('#studentForm button[type="submit"]').textContent = "Cập nhật";
            // Gắn cờ đang sửa
            window.editingStudent = true;
        });
}

function deleteStudent(studentId) {
    if (confirm('Bạn có chắc muốn xóa sinh viên này?')) {
        fetch(`http://localhost:5000/delete_student/${studentId}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                loadStudents();
            } else {
                alert('Xóa thất bại!');
            }
        });
    }
}
// ...existing code...
function openEditModal(studentId) {
    fetch(`http://localhost:5000/student/${studentId}`)
        .then(res => res.json())
        .then(sv => {
            document.getElementById('editStudentId').value = sv.studentId;
            document.getElementById('editName').value = sv.name;
            document.getElementById('editDob').value = sv.dob;
            document.getElementById('editClass').value = sv.class;
            document.getElementById('editScore').value = sv.score;
            document.getElementById('editMajor').value = sv.major;
            document.getElementById('editModal').style.display = 'flex';
        });
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Xử lý submit form sửa
document.getElementById('editStudentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const studentId = document.getElementById('editStudentId').value;
    fetch(`http://localhost:5000/update_student/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('editName').value,
            dob: document.getElementById('editDob').value,
            class: document.getElementById('editClass').value,
            score: document.getElementById('editScore').value,
            major: document.getElementById('editMajor').value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            closeEditModal();
            loadStudents();
        } else {
            alert('Cập nhật thất bại!');
        }
    });
});
function searchById() {
    const msv = document.getElementById('searchByIdInput').value.trim();
    if (!msv) {
        loadStudents(); // Nếu ô trống thì hiện lại toàn bộ danh sách
        return;
    }
    fetch(`http://localhost:5000/student/${msv}`)
        .then(res => {
            if (!res.ok) throw new Error('Không tìm thấy sinh viên!');
            return res.json();
        })
        .then(sv => {
            const table = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
            table.innerHTML = '';
            if (sv && sv.studentId) {
                const newRow = table.insertRow();
                newRow.insertCell(0).textContent = sv.studentId;
                newRow.insertCell(1).textContent = sv.name;
                newRow.insertCell(2).textContent = sv.dob;
                newRow.insertCell(3).textContent = sv.class;
                newRow.insertCell(4).textContent = sv.score;
                newRow.insertCell(5).textContent = sv.major;
                const sx = newRow.insertCell(6);
                sx.innerHTML = `
                    <button onclick="editStudent('${sv.studentId}')">Sửa</button>
                    <button onclick="deleteStudent('${sv.studentId}')">Xóa</button>`;
            } else {
                alert('Không tìm thấy sinh viên!');
            }
        })
        .catch(() => {
            alert('Không tìm thấy sinh viên!');
            loadStudents();
        });
}
// Tự động tải danh sách sinh viên khi trang load
window.onload = loadStudents;