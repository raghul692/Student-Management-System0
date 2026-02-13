const db = require('../config/db');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const { search, status, class_id } = req.query;
        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR admission_number LIKE ? OR roll_number LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (class_id) {
            query += ' AND class_id = ?';
            params.push(class_id);
        }

        query += ' ORDER BY created_at DESC';

        const [students] = await db.execute(query, params);
        res.render('students', {
            title: 'Student Management',
            students,
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        req.flash('error', 'An error occurred while fetching students');
        res.redirect('/dashboard');
    }
};

// Show add student form
exports.getAddStudent = (req, res) => {
    res.render('add-student', {
        title: 'Add Student',
        user: req.session.user,
        error: req.flash('error'),
        success: req.flash('success')
    });
};

// Add new student
exports.postAddStudent = async (req, res) => {
    const {
        admission_number, first_name, last_name, roll_number,
        gender, date_of_birth, email, phone, address,
        class_id, section, academic_year, status
    } = req.body;

    try {
        await db.execute(
            `INSERT INTO students (admission_number, first_name, last_name, roll_number, gender, 
                                   date_of_birth, email, phone, address, class_id, section, academic_year, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [admission_number, first_name, last_name, roll_number, gender,
             date_of_birth, email, phone, address, class_id || null, section, academic_year, status || 'active']
        );

        req.flash('success', 'Student added successfully!');
        res.redirect('/students');
    } catch (error) {
        console.error('Error adding student:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            req.flash('error', 'Admission number or roll number already exists');
        } else {
            req.flash('error', 'An error occurred while adding the student');
        }
        res.redirect('/students/add');
    }
};

// Show edit student form
exports.getEditStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            req.flash('error', 'Student not found');
            return res.redirect('/students');
        }

        res.render('edit-student', {
            title: 'Edit Student',
            student: rows[0],
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        req.flash('error', 'An error occurred while fetching the student');
        res.redirect('/students');
    }
};

// Update student
exports.postEditStudent = async (req, res) => {
    const { id } = req.params;
    const {
        admission_number, first_name, last_name, roll_number,
        gender, date_of_birth, email, phone, address,
        class_id, section, academic_year, status
    } = req.body;

    try {
        await db.execute(
            `UPDATE students SET 
                admission_number = ?, first_name = ?, last_name = ?, roll_number = ?,
                gender = ?, date_of_birth = ?, email = ?, phone = ?, address = ?,
                class_id = ?, section = ?, academic_year = ?, status = ?
             WHERE id = ?`,
            [admission_number, first_name, last_name, roll_number,
             gender, date_of_birth, email, phone, address, class_id || null, 
             section, academic_year, status || 'active', id]
        );

        req.flash('success', 'Student updated successfully!');
        res.redirect('/students');
    } catch (error) {
        console.error('Error updating student:', error);
        req.flash('error', 'An error occurred while updating the student');
        res.redirect(`/students/edit/${id}`);
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute('DELETE FROM students WHERE id = ?', [id]);
        req.flash('success', 'Student deleted successfully!');
        res.redirect('/students');
    } catch (error) {
        console.error('Error deleting student:', error);
        req.flash('error', 'An error occurred while deleting the student');
        res.redirect('/students');
    }
};

// View student details
exports.getStudentDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const [studentRows] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
        
        if (studentRows.length === 0) {
            req.flash('error', 'Student not found');
            return res.redirect('/students');
        }

        const [marksRows] = await db.execute(
            'SELECT m.*, s.subject_name FROM marks m LEFT JOIN subjects s ON m.subject_id = s.id WHERE m.student_id = ? ORDER BY m.exam_date DESC',
            [id]
        );

        res.render('student-details', {
            title: 'Student Details',
            student: studentRows[0],
            marks: marksRows,
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Error fetching student details:', error);
        req.flash('error', 'An error occurred while fetching student details');
        res.redirect('/students');
    }
};
