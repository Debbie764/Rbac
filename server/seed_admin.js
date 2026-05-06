const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedSystem() {
    console.log('Starting System Seeding...');

    // 1. Seed Departments
    const depts = [
        ['Computer Science', 'Department of Computer Science', 'CSC'],
        ['Statistics', 'Department of Statistics', 'STA'],
        ['Business Administration', 'Department of Business Admin', 'BAM'],
        ['Electrical Engineering', 'Department of Electrical Engineering', 'ELE']
    ];

    for (const dept of depts) {
        await new Promise((resolve) => {
            db.run(`INSERT OR IGNORE INTO departments (name, description, code) VALUES (?, ?, ?)`, dept, resolve);
        });
    }
    console.log('Departments seeded.');

    // 2. Assign All Permissions to ADMIN Role
    await new Promise((resolve) => {
        db.all(`SELECT id FROM permissions`, [], async (err, perms) => {
            for (const perm of perms) {
                db.run(`INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [1, perm.id]);
            }
            resolve();
        });
    });
    console.log('Admin permissions assigned.');

    // 3. Seed Admin User
    const username = 'admin_musa';
    const password = 'password123';
    const email = 'admin@kogipolyms.edu.ng';
    const fullName = 'Abduljelil Musa';
    const roleId = 1; // ADMIN

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    db.run(
        `INSERT OR IGNORE INTO users (username, email, password_hash, role_id, full_name, staff_id, department_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, roleId, fullName, 'KP-ADMIN-001', 1],
        (err) => {
            if (err) {
                console.error('Error seeding admin:', err.message);
            } else {
                console.log('Admin user seeded successfully!');
                console.log('Username: ' + username);
                console.log('Password: ' + password);
            }
            process.exit();
        }
    );
}

seedSystem();
