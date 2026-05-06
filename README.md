# Lightweight Identity and Access Management System (IAM)
## Case Study: Kogi State Polytechnic, Lokoja

In today’s digital age, Kogi State Polytechnic increasingly depends on information systems to support teaching, learning, research, and administration. This system provides a centralized, secure, and automated framework for managing digital identities across the institution.

## 1. Project Background
As institutions adopt more digital platforms, the challenge of ensuring secure and appropriate access to institutional resources becomes central to effective IT governance. This IAM system enforces the principles of **least privilege** and **continuous verification**, forming a core component of a **Zero Trust** security model.

### 1.1 Statement of the Problem
Kogi State Polytechnic, Lokoja, previously operated independent digital platforms (Student Portal, LMS, Staff Portals) without a unified identity framework. This fragmented approach led to:
- Inconsistent access control policies.
- High administrative burden due to manual account management.
- Security risks from dormant or improperly privileged accounts.
- Poor user experience due to multiple login credentials.

### 1.2 Aim and Objectives
The aim of this study is to design and implement a lightweight IAM system tailored to the needs of the Kogi State Polytechnic Portal.
1. To examine existing access mechanisms and identify security/operational challenges.
2. To design a lightweight framework incorporating **PBAC (Permission-Based Access Control)** and automated provisioning.
3. To implement and evaluate the system with respect to usability, security, and efficiency.
4. To prepare for deployment on AWS Free Tier.

## 2. Key System Features
- **Centralized Authentication**: Unified login (SSO) for Student Portal, LMS, and Admin platforms.
- **Dynamic PBAC**: Granular permission management (e.g., `MANAGE_USERS`, `MANAGE_ACADEMIC`).
- **Institutional Management**: CRUD operations for **Departments**, **Levels**, and **Courses**.
- **Automated Provisioning**: Streamlined onboarding for students (Matric Numbers) and staff (Staff IDs).
- **Incident Response**: Real-time threat monitoring and automatic account quarantine.
- **Audit Logging**: Comprehensive traceability of all administrative actions.

## 3. Quick Start Guide

### Backend (Server)
```bash
cd server
npm install
node init_db.js    # Initialize fresh database
node seed_admin.js  # Seed institutional data & admin
npm start           # Run on http://localhost:5000
```

### Frontend (Client)
```bash
cd client
npm install
npm run dev         # Run on http://localhost:5173
```

## 4. Default Admin Credentials
- **Username**: `admin_musa`
- **Password**: `password123`

---
*Developed as part of the HND CPS Project - Networking Projects.*
