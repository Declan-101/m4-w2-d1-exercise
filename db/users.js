// Exercise-only demo accounts, matching the assignment.
const records = [
  { id: 1, username: 'westcliff', password: 'secret', displayName: 'WestCliff', emails: [{ value: 'west@example.com' }] },
  { id: 2, username: 'westcliffclass', password: 'birthday', displayName: 'WestCliffUniversity', emails: [{ value: 'cliff@example.com' }] }
];
exports.findById = function(id, cb) {
  process.nextTick(function() { cb(null, records.find(user => user.id === Number(id)) || false); });
};
exports.findByUsername = function(username, cb) {
  process.nextTick(function() { cb(null, records.find(user => user.username === username) || null); });
};
