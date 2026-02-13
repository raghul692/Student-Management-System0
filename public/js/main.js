// Student Management System - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Form validation enhancement
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Confirm dialogs for dangerous actions
    const confirmButtons = document.querySelectorAll('[data-confirm]');
    confirmButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm') || 'Are you sure?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // Search debouncing
    const searchInput = document.getElementById('search');
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Auto-submit form after 500ms of no typing
                if (this.value.length >= 3 || this.value.length === 0) {
                    this.form.submit();
                }
            }, 500);
        });
    }

    // Calculate grade display
    function calculateGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    }

    // Mark percentage color coding
    const percentageElements = document.querySelectorAll('[data-percentage]');
    percentageElements.forEach(el => {
        const percentage = parseFloat(el.getAttribute('data-percentage'));
        if (percentage >= 60) {
            el.classList.add('text-success');
        } else if (percentage >= 40) {
            el.classList.add('text-warning');
        } else {
            el.classList.add('text-danger');
        }
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Mobile menu close on link click
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                bootstrap.Collapse.getInstance(navbarCollapse).hide();
            }
        });
    });

    // Dynamic academic year
    const academicYearInput = document.getElementById('academic_year');
    if (academicYearInput && !academicYearInput.value) {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        academicYearInput.value = currentYear + '-' + nextYear;
    }

    // Print functionality
    const printButtons = document.querySelectorAll('[data-print]');
    printButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-print');
            const printWindow = window.open('', '_blank');
            const content = document.getElementById(target).innerHTML;
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print - Student Management System</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
                    <style>
                        body { padding: 20px; }
                        @media print { .no-print { display: none !important; } }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 500);
        });
    });

    // Data table enhancements
    const tables = document.querySelectorAll('.table');
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.style.animationDelay = `${index * 0.05}s`;
        });
    });
});

// Utility functions
const SMS = {
    // Format date
    formatDate(date, format = 'short') {
        const options = format === 'short' 
            ? { year: 'numeric', month: 'short', day: 'numeric' }
            : { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return new Date(date).toLocaleDateString('en-US', options);
    },

    // Calculate percentage
    calculatePercentage(obtained, max) {
        return max > 0 ? ((obtained / max) * 100).toFixed(2) : 0;
    },

    // Get grade from percentage
    getGrade(percentage) {
        if (percentage >= 90) return { grade: 'A+', class: 'success' };
        if (percentage >= 80) return { grade: 'A', class: 'success' };
        if (percentage >= 70) return { grade: 'B+', class: 'info' };
        if (percentage >= 60) return { grade: 'B', class: 'info' };
        if (percentage >= 50) return { grade: 'C', class: 'warning' };
        if (percentage >= 40) return { grade: 'D', class: 'warning' };
        return { grade: 'F', class: 'danger' };
    },

    // Show notification
    showNotification(message, type = 'success') {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
        
        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        notification.style.zIndex = '9999';
        notification.innerHTML = `
            <i class="fas fa-${icon} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            bootstrap.Alert.getInstance(notification)?.close();
        }, 5000);
    }
};

// Export for use in other scripts
window.SMS = SMS;
