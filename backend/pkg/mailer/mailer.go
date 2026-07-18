package mailer

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strings"

	"backend/pkg/config"
	"backend/pkg/logger"
)

type Mailer struct {
	cfg *config.Config
	log *logger.Logger
}

func New(cfg *config.Config, log *logger.Logger) *Mailer {
	return &Mailer{cfg: cfg, log: log}
}

// SendPasswordReset sends a password reset email.
// If SMTPHost is empty (dev mode), it logs the reset link to stdout instead of sending.
func (m *Mailer) SendPasswordReset(toEmail, toName, resetLink string) error {
	if m.cfg.SMTPHost == "" {
		m.log.Info(fmt.Sprintf("[DEV MAILER] Password reset link for %s (%s): %s", toName, toEmail, resetLink))
		return nil
	}
	subject := "Reset your password"
	body := fmt.Sprintf(`Hi %s,

You requested a password reset. Click the link below to set a new password:

%s

This link will expire in 1 hour. If you did not request this, please ignore this email.

Blog Engine Admin`, toName, resetLink)
	return m.sendEmail(toEmail, subject, body)
}

func (m *Mailer) sendEmail(to, subject, body string) error {
	addr := fmt.Sprintf("%s:%d", m.cfg.SMTPHost, m.cfg.SMTPPort)
	headers := strings.Join([]string{
		fmt.Sprintf("From: %s", m.cfg.SMTPFrom),
		fmt.Sprintf("To: %s", to),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
	}, "\r\n")
	msg := headers + "\r\n\r\n" + body
	auth := smtp.PlainAuth("", m.cfg.SMTPUser, m.cfg.SMTPPass, m.cfg.SMTPHost)
	tlsCfg := &tls.Config{ServerName: m.cfg.SMTPHost}
	conn, err := tls.Dial("tcp", addr, tlsCfg)
	if err != nil {
		// fallback to plain SMTP if TLS dial fails
		return smtp.SendMail(addr, auth, m.cfg.SMTPFrom, []string{to}, []byte(msg))
	}
	defer conn.Close()
	client, err := smtp.NewClient(conn, m.cfg.SMTPHost)
	if err != nil {
		return err
	}
	if err = client.Auth(auth); err != nil {
		return err
	}
	if err = client.Mail(m.cfg.SMTPFrom); err != nil {
		return err
	}
	if err = client.Rcpt(to); err != nil {
		return err
	}
	w, err := client.Data()
	if err != nil {
		return err
	}
	_, err = fmt.Fprint(w, msg)
	if err != nil {
		return err
	}
	return w.Close()
}
