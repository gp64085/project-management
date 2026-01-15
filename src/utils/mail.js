import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Sends an email using the configured SMTP server.
 * @param {Object} options - An object containing the email options
 * @param {string} options.email - The email address to send the email to
 * @param {string} options.subject - The subject of the email
 * @param {Mailgen.Content} options.mailgenContent - The Mailgen content object
 * @throws {Error} - An error if the email could not be sent
 */
/*******  e146052f-fc2c-4078-83cf-520159e00bd3  *******/ const sendMail =
  async (options) => {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Task Manager',
        link: 'https://taskmanagelink.com', // Dummy url
      },
    });

    const emailTextual = mailGenerator.generatePlaintext(
      options.mailgenContent,
    );
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mail = {
      from: 'mail.taskmanager@example.com',
      to: options.email,
      subject: options.subject,
      text: emailTextual,
      html: emailHtml,
    };

    try {
      await transport.sendMail(mail);
    } catch (error) {
      console.error(
        'Error sending email, make sure SMTP is configured correctly',
        error,
      );
    }
  };

/**
 * Generates the content for an email verification email.
 * @param {string} username - The username of the user to be verified
 * @param {string} verificationUrl - The verification URL to be included in the email
 * @returns {Mailgen.Content} An object containing the email content
 */
const emailVerificationMailContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro:
        "Welcome to Project Management! We're very excited to have you on board.",
      action: {
        instructions: 'To verify your email, please click on the button below:',
        button: {
          color: '#22BC66',
          text: 'Confirm your email',
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

/**
 * Generates the content for a forgot password email.
 * @param {string} username - The username of the user who forgot their password
 * @param {string} resetUrl - The URL to be included in the email for the user to reset their password
 * @returns {Mailgen.Content} An object containing the email content
 */
const forgotPasswordMailContent = (username, resetUrl) => {
  return {
    body: {
      name: username,
      intro:
        'You have received this email because a password reset request for your account was received.',
      action: {
        instructions: 'Click the button below to reset your password:',
        button: {
          color: '#DC4D2F',
          text: 'Reset your password',
          link: 'https://mailgen.js/reset?s=b350163a1a010d9729feb74992c1a010',
        },
      },
      outro:
        'If you did not request a password reset, no further action is required on your part.',
    },
  };
};

export { emailVerificationMailContent, forgotPasswordMailContent, sendMail };
