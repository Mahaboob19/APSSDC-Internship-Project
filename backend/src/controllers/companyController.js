const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { readDB, writeDB } = require('../data/dbClient');

// GET /api/companies
async function getAllCompanies(req, res, next) {
  try {
    const db = await readDB();
    res.json({ success: true, data: db.companies });
  } catch (err) {
    next(err);
  }
}

// GET /api/companies/:id
async function getCompanyById(req, res, next) {
  try {
    const db = await readDB();
    const company = db.companies.find((c) => c.id === req.params.id);

    if (!company) {
      const err = new Error('Company not found');
      err.statusCode = 404;
      throw err;
    }

    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
}

// POST /api/companies  (Admin)
async function createCompany(req, res, next) {
  try {
    const { name, role, package: pkg, location, description, driveDate } = req.body;

    if (!name || !role) {
      const err = new Error('Fields "name" and "role" are required');
      err.statusCode = 400;
      throw err;
    }

    const db = await readDB();
    const newCompany = {
      id: uuidv4(),
      name,
      role,
      package: pkg || 'Not specified',
      location: location || 'Not specified',
      description: description || '',
      driveDate: driveDate || null,
    };

    db.companies.push(newCompany);
    await writeDB(db);

    logger.info('Company created', { id: newCompany.id, name: newCompany.name });
    res.status(201).json({ success: true, data: newCompany });
  } catch (err) {
    next(err);
  }
}

// PUT /api/companies/:id  (Admin)
async function updateCompany(req, res, next) {
  try {
    const db = await readDB();
    const index = db.companies.findIndex((c) => c.id === req.params.id);

    if (index === -1) {
      const err = new Error('Company not found');
      err.statusCode = 404;
      throw err;
    }

    db.companies[index] = { ...db.companies[index], ...req.body, id: db.companies[index].id };
    await writeDB(db);

    logger.info('Company updated', { id: req.params.id });
    res.json({ success: true, data: db.companies[index] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/companies/:id  (Admin)
async function deleteCompany(req, res, next) {
  try {
    const db = await readDB();
    const index = db.companies.findIndex((c) => c.id === req.params.id);

    if (index === -1) {
      const err = new Error('Company not found');
      err.statusCode = 404;
      throw err;
    }

    const removed = db.companies.splice(index, 1);
    await writeDB(db);

    logger.info('Company deleted', { id: removed[0].id });
    res.json({ success: true, data: removed[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};

