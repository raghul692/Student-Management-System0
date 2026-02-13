const db = require('../config/db');

// Grade calculation helper
const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

// Get all marks (marksheet view)
exports.getAllMarks = async (req, res) => {
    try {
        const { academic_year, exam_type, student_id } = req.query;

        let query = `
            SELECT s.id as student_id, s.admission_number, s.first_name, s.last_name, 
                   s.roll_number, s.class_id, s.section,
                   m.id as mark_id, m.subject_id, m.exam_type, m.marks_obtained, 
                   m.max_marks, m.exam_date, m.academic_year
            FROM students s
            LEFT JOIN marks m ON s.id = m.student_id
            WHERE s.status = 'active'
        `;
        const params = [];

        if (academic_year) {
            query += ' AND m.academic_year = ?';
            params.push(academic_year);
        }

        if (exam_type) {
            query += ' AND m.exam_type = ?';
            params.push(exam_type);
        }

        if (student_id) {
            query += ' AND s.id = ?';
            params.push(student_id);
        }

        query += ' ORDER BY s.last_name, s.first_name, m.exam_date DESC';

        const [rows] = await db.execute(query, params);

        // Get students for dropdown
        const [students] = await db.execute('SELECT id, admission_number, first_name, last_name FROM students WHERE status = ? ORDER BY last_name', ['active']);

        // Get subjects for display
        const [subjects] = await db.execute('SELECT * FROM subjects WHERE is_active = 1');

        res.render('marks', {
            title: 'Marks Management',
            marksData: rows,
            students,
            subjects,
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Error fetching marks:', error);
        req.flash('error', 'An error occurred while fetching marks');
        res.redirect('/dashboard');
    }
};

// Show add marks form
exports.getAddMarks = async (req, res) => {
    try {
        const [students] = await db.execute('SELECT id, admission_number, first_name, last_name, roll_number FROM students WHERE status = ? ORDER BY last_name', ['active']);
        const [subjects] = await db.execute('SELECT * FROM subjects WHERE is_active = 1');

        res.render('add-marks', {
            title: 'Add Marks',
            students,
            subjects,
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Error loading add marks form:', error);
        req.flash('error', 'An error occurred');
        res.redirect('/marks');
    }
};

// Add marks for a student
exports.postAddMarks = async (req, res) => {
    const { student_id, subject_id, exam_type, marks_obtained, max_marks, exam_date, academic_year } = req.body;

    try {
        await db.execute(
            `INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks, exam_date, academic_year)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [student_id, subject_id, exam_type, marks_obtained, max_marks || 100, exam_date, academic_year]
        );

        req.flash('success', 'Marks added successfully!');
        res.redirect('/marks');
    } catch (error) {
        console.error('Error adding marks:', error);
        req.flash('error', 'An error occurred while adding marks');
        res.redirect('/marks/add');
    }
};

// Update marks
exports.postUpdateMarks = async (req, res) => {
    const { id } = req.params;
    const { marks_obtained, max_marks, exam_date } = req.body;

    try {
        await db.execute(
            'UPDATE marks SET marks_obtained = ?, max_marks = ?, exam_date = ? WHERE id = ?',
            [marks_obtained, max_marks || 100, exam_date, id]
        );

        req.flash('success', 'Marks updated successfully!');
        res.redirect('/marks');
    } catch (error) {
        console.error('Error updating marks:', error);
        req.flash('error', 'An error occurred while updating marks');
        res.redirect('/marks');
    }
};

// Delete marks
exports.deleteMarks = async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute('DELETE FROM marks WHERE id = ?', [id]);
        req.flash('success', 'Marks deleted successfully!');
        res.redirect('/marks');
    } catch (error) {
        console.error('Error deleting marks:', error);
        req.flash('error', 'An error occurred while deleting marks');
        res.redirect('/marks');
    }
};

// Generate student report card
exports.getReportCard = async (req, res) => {
    const { student_id, academic_year } = req.query;

    try {
        // Get student info
        const [studentRows] = await db.execute('SELECT * FROM students WHERE id = ?', [student_id]);
        
        if (studentRows.length === 0) {
            req.flash('error', 'Student not found');
            return res.redirect('/marks');
        }

        const student = studentRows[0];

        // Get marks
        const [marksRows] = await db.execute(
            `SELECT m.*, s.subject_name, s.subject_code 
             FROM marks m 
             LEFT JOIN subjects s ON m.subject_id = s.id 
             WHERE m.student_id = ? AND m.academic_year = ?
             ORDER BY s.subject_name, m.exam_type`,
            [student_id, academic_year]
        );

        // Calculate totals and averages
        let totalMarks = 0;
        let totalMaxMarks = 0;
        let subjectScores = {};

        marksRows.forEach(mark => {
            const key = mark.subject_name || 'Unknown';
            if (!subjectScores[key]) {
                subjectScores[key] = { obtained: 0, max: 0, exams: [] };
            }
            subjectScores[key].obtained += parseFloat(mark.marks_obtained);
            subjectScores[key].max += parseFloat(mark.max_marks);
            subjectScores[key].exams.push(mark);
        });

        // Calculate overall percentage
        Object.values(subjectScores).forEach(subject => {
            totalMarks += subject.obtained;
            totalMaxMarks += subject.max;
        });

        const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks * 100) : 0;
        const overallGrade = calculateGrade(overallPercentage);

        res.render('report-card', {
            title: 'Report Card - ' + student.first_name + ' ' + student.last_name,
            student,
            subjectScores,
            marksRows,
            totalMarks,
            totalMaxMarks,
            overallPercentage,
            overallGrade,
            user: req.session.user,
            academic_year
        });
    } catch (error) {
        console.error('Error generating report card:', error);
        req.flash('error', 'An error occurred while generating report card');
        res.redirect('/marks');
    }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        // Total students
        const [studentCount] = await db.execute('SELECT COUNT(*) as count FROM students WHERE status = ?', ['active']);
        
        // Total marks entries
        const [marksCount] = await db.execute('SELECT COUNT(*) as count FROM marks');
        
        // Recent students
        const [recentStudents] = await db.execute('SELECT * FROM students ORDER BY created_at DESC LIMIT 5');
        
        // Recent marks
        const [recentMarks] = await db.execute(`
            SELECT m.*, s.first_name, s.last_name 
            FROM marks m 
            JOIN students s ON m.student_id = s.id 
            ORDER BY m.created_at DESC LIMIT 10
        `);

        // Students by class/section
        const [studentsByClass] = await db.execute(
            'SELECT class_id, section, COUNT(*) as count FROM students WHERE status = ? GROUP BY class_id, section',
            ['active']
        );

        res.render('dashboard', {
            title: 'Dashboard - Student Management System',
            stats: {
                totalStudents: studentCount[0].count,
                totalMarksEntries: marksCount[0].count,
                recentStudents,
                recentMarks,
                studentsByClass
            },
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.render('dashboard', {
            title: 'Dashboard - Student Management System',
            stats: {
                totalStudents: 0,
                totalMarksEntries: 0,
                recentStudents: [],
                recentMarks: [],
                studentsByClass: []
            },
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    }
};
