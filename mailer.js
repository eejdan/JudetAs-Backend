if (require.main === module) {
    require('dotenv').config();
}

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const client = mailgun.client({
    username: 'api',
    key: process.env.BACKEND_MAILGUN_SENDING_KEY
});
const domain = process.env.BACKEND_MAILGUN_DOMAIN;

const messageTemplates = { //tbd html field
    confirmEmail: {
        from: 'Administrare <noreply@judetas.org>',
        to: (recipient => `${recipient}`),
        subject: 'JudetaAs Confirmare Email',
        text: ((fullName, username, confirmLink, rejectLink) => `
        Buna ziua, ${fullName}!
        Va rog confirmati crearea contului de utilizator: "${username}" pe JudetAs apasand pe linkul urmator: 
        ${confirmLink}
        Va dorim o zi buna!
        \n
        Nu recunoasteti acest cont? Click pe linkul urmator pentru a anula crearea contului:
        ${rejectLink}
        `)
    }
}

/* const messageData = {
    from: 'Excited User <noreply@judetas.org>',
    to: 'danielbirleanu@gmail.com',
    subject: 'JudetAs Confirmare',
    text: 'Testing some Mailgun awesomeness!'
}; */

const sendEmailConfirmation = (recipient, fullName, username, confirmLink,rejectLink) => {
    var emailData = {
        from: messageTemplates.confirmEmail.from,
        to: messageTemplates.confirmEmail.to(recipient),
        subject: messageTemplates.confirmEmail.subject,
        text: messageTemplates.confirmEmail.text(fullName, username, confirmLink, rejectLink)
    }
    client.messages.create(domain, emailData)
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.error(err);
    });
}

module.exports = {
    sendEmailConfirmation
}
/* client.messages.create(domain, messageData)
.then((res) => {
  console.log(res);
})
.catch((err) => {
  console.error(err);
}); */