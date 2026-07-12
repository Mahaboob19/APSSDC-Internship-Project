const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { readDB, writeDB } = require('../data/dbClient');

// POST /api/applications  (Student applies to a company)
async function applyToCompany(req, res, next) {
  try {
    const { companyId, studentName, studentEmail } = req.body;

    if (!companyId || !studentName || !studentEmail) {
      const err = new Error('Fields "companyId", "studentName", and "studentEmail" are required');
      err.statusCode = 400;
      throw err;
    }

    const db = await readDB();
    const company = db.companies.find((c) => c.id === companyId);

    if (!company) {
      const err = new Error('Company not found');
      err.statusCode = 404;
      throw err;
    }

    const newApplication = {
      id: uuidv4(),
      companyId,
      companyName: company.name,
      studentName,
      studentEmail,
      status: 'Applied', // Prototype: fixed initial status, no workflow engine
      appliedAt: new Date().toISOString(),
    };

    db.applications.push(newApplication);
    await writeDB(db);

    logger.info('New application submitted', {
      applicationId: newApplication.id,
      companyId,
      studentEmail,
    });

    res.status(201).json({ success: true, data: newApplication });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications?email=student@example.com  (Student tracks their applications)
async function getApplicationsByEmail(req, res, next) {
  try {
    const { email } = req.query;

    if (!email) {
      const err = new Error('Query parameter "email" is required');
      err.statusCode = 400;
      throw err;
    }

    const db = await readDB();
    const applications = db.applications.filter(
      (a) => a.studentEmail.toLowerCase() === email.toLowerCase()
    );

    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/all  (Admin: view all applications)
async function getAllApplications(req, res, next) {
  try {
    const db = await readDB();
    res.json({ success: true, data: db.applications });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  applyToCompany,
  getApplicationsByEmail,
  getAllApplications,
};

