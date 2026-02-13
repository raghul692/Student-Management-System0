# Student Management System

A comprehensive full-stack web application for managing student information and academic performance in educational institutions. Built with Node.js, Express, and MySQL.

## Features

### Core Features
- **User Authentication** - Secure login/logout with session management
- **Student Management** - Add, view, edit, and delete student records
- **Marks Management** - Enter marks, calculate totals and averages
- **Dashboard** - Overview statistics and quick access to operations
- **Reports** - Generate printable report cards with grades

### Security Features
- Password hashing with bcrypt
- Session-based authentication
- SQL injection prevention
- Input validation and sanitization

## Technology Stack

### Frontend
- HTML5
- CSS3 with Bootstrap 5
- JavaScript (ES6+)
- Font Awesome icons

### Backend
- Node.js
- Express.js
- EJS (templating engine)

### Database
- MySQL 8.0
- MySQL2 (Node.js driver)

## Project Structure

```
Student Management System/
├── config/
│   ├── db.js          # Database connection
│   └── schema.sql     # Database schema
├── controllers/
│   ├── authController.js
│   ├── studentController.js
│   └── marksController.js
├── middleware/
│   └── auth.js        # Authentication middleware
├── routes/
│   ├── auth.js
│   ├── students.js
│   └── marks.js
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── dashboard.ejs
│   ├── login.ejs
│   ├── students.ejs
│   ├── add-student.ejs
│   ├── edit-student.ejs
│   ├── student-details.ejs
│   ├── marks.ejs
│   ├── add-marks.ejs
│   ├── report-card.ejs
│   ├── 404.ejs
│   └── 500.ejs
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── app.js
├── server.js
├── setup.js
├── package.json
└── .env.example
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "Student Management System"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=sms_db
   ```

4. **Set up the database**
   
   Option A: Run the setup script (recommended)
   ```bash
   node setup.js
   ```
   
   Option B: Manual setup
   - Create a database named `sms_db` in MySQL
   - Import the schema: `mysql -u root -p sms_db < config/schema.sql`
   - Visit http://localhost:3000/auth/setup to create the admin user

5. **Start the application**
   ```bash
   npm start
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Default Login Credentials
- **Username:** admin
- **Password:** admin123

## Usage

### Adding Students
1. Navigate to Students → Add New Student
2. Fill in the student details form
3. Click "Add Student" to save

### Managing Marks
1. Navigate to Marks → Add Marks
2. Select a student and subject
3. Enter marks and exam details
4. Click "Save Marks"

### Generating Reports
1. Navigate to Marks section
2. Filter by student or exam type
3. Click on a student to view their report card
4. Use the Print button to print or save as PDF

## Database Schema

### Users Table
Stores system users with role-based access:
- id, username, password_hash, email, full_name, role, is_active

### Students Table
Stores student records:
- id, admission_number, first_name, last_name, roll_number, gender, date_of_birth, email, phone, address, class_id, section, academic_year, status

### Marks Table
Stores academic marks:
- id, student_id, subject_id, exam_type, marks_obtained, max_marks, exam_date, academic_year

### Subjects Table
Stores subject information:
- id, subject_code, subject_name, credit_hours

## Grade Calculation

| Percentage | Grade |
|-----------|-------|
| 90-100%   | A+    |
| 80-89%    | A     |
| 70-79%    | B+    |
| 60-69%    | B     |
| 50-59%    | C     |
| 40-49%    | D     |
| Below 40% | F     |

## API Routes

### Authentication
- GET /auth/login - Login page
- POST /auth/login - Process login
- GET /auth/logout - Logout
- GET /auth/setup - Create admin user

### Students
- GET /students - List all students
- GET /students/add - Add student form
- POST /students/add - Create student
- GET /students/edit/:id - Edit student form
- POST /students/edit/:id - Update student
- GET /students/details/:id - View student details
- POST /students/delete/:id - Delete student

### Marks
- GET /marks - List all marks
- GET /marks/add - Add marks form
- POST /marks/add - Create marks entry
- POST /marks/update/:id - Update marks
- POST /marks/delete/:id - Delete marks
- GET /marks/report-card - Generate report card

## Future Enhancements

- Multi-role authentication (Teacher, Student portals)
- Attendance tracking module
- Fee management system
- SMS/Email notifications
- AI-based performance prediction
- Mobile application
- Advanced analytics and dashboards

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.
