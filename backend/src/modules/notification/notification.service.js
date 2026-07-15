function createNotification(user, type, content) {
  return {
    userId: user.id,
    type,
    recipient: user.email,
    content,
    status: 'SENT'
  };
}

module.exports = { createNotification };
