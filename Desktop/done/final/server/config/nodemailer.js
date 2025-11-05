import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
    auth:{
        user: "sarankumar742001@gmail.com", 
        pass: "qttv zuzh vefc gjwp"
    }
     

  /*  host:"smtp-relay.brevo.com",
    port:587,
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
        }
  */

})

export default transporter