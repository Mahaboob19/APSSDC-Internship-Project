const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

/**
 * Single source of truth for reading/writing the prototype JSON "database".
 *
 * Why centralize this (fixes a Phase 2 review finding):
 * Both companyController and applicationController previously implemented
 * their own copies of readDB()/writeDB() against the same file. That's a
 * maintainability risk — any future change (async I/O, file locking,
 * migrating to a real database) would need to be made in two places and
 * could drift out of sync. Centralizing it here means there's exactly
 * one place that knows how the data is persisted.
 *
 * Note (documented, not fixed): reads/writes are synchronous and not
 * safe under high concurrent write load. For this prototype's expected
 * traffic (internship demo, not production scale), this is an accepted
 * tradeoff — adding file locking or a queue would add complexity with
 * no learning value for the AWS/DevOps goals of this project.
 */
function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readDB, writeDB };
