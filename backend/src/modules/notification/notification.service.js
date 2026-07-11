const { v4: uuid } = require('uuid');

function send(db, user, type, content) {
  const notification = {
    id: uuid(), userId: user.id, type, recipient: user.email,
    content, status: 'SENT', createdAt: new Date().toISOString()
  };
  db.notifications.push(notification);
  return notification;
}

module.exports = { send };
