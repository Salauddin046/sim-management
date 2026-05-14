const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,

  auth: {
    user: 'sim.operation.intellicar@gmail.com',
    pass: 'ryetdyellwcqrjxm',
  },
})

transporter.sendMail({
  from: 'sim.operation.intellicar@gmail.com',
  to: 'kssalauddin@intellicar.in',
  subject: 'SMTP Test',
  text: 'Working',
})
.then(() => console.log('Mail sent'))
.catch(console.error)