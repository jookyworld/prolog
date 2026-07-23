package com.back.global.mail;

import com.back.global.exception.type.BadRequestException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    @Value("${mail.admin:}")
    private String adminEmail;

    public void sendEmailVerificationCode(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from, "ProLog");
            helper.setTo(to);
            helper.setSubject("[ProLog: 상급노하우] 회원가입 이메일 인증 코드");
            helper.setText(
                    """
                    안녕하세요, 상급노하우입니다.

                    회원가입 이메일 인증 코드를 알려드립니다.

                    인증 코드: %s

                    해당 코드는 10분간 유효합니다.
                    본인이 요청하지 않으셨다면 이 메일을 무시해주세요.
                    """
                            .formatted(code));
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new BadRequestException("이메일 전송에 실패했습니다.");
        }
    }

    @Async
    public void sendInquiryNotificationToAdmin(String nickname, String title) {
        if (adminEmail == null || adminEmail.isBlank()) {
            log.warn("관리자 이메일이 설정되지 않아 문의 알림을 발송하지 않습니다.");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from, "ProLog");
            helper.setTo(adminEmail);
            helper.setSubject("[ProLog: 상급노하우] 새 문의가 접수되었습니다");
            helper.setText(
                    """
                    새로운 문의가 접수되었습니다.

                    작성자: %s
                    제목: %s

                    관리자 페이지에서 확인해주세요.
                    """
                            .formatted(nickname, title));
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("문의 알림 메일 발송 실패: {}", e.getMessage());
        }
    }

    @Async
    public void sendInquiryAnswerNotification(String to, String title) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from, "ProLog");
            helper.setTo(to);
            helper.setSubject("[ProLog: 상급노하우] 문의에 답변이 등록되었습니다");
            helper.setText(
                    """
                    안녕하세요, 상급노하우입니다.

                    문의하신 내용에 답변이 등록되었습니다.

                    제목: %s

                    앱에서 확인해주세요.
                    """
                            .formatted(title));
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("문의 답변 알림 메일 발송 실패: {}", e.getMessage());
        }
    }

    public void sendPasswordResetCode(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from, "ProLog");
            helper.setTo(to);
            helper.setSubject("[ProLog: 상급노하우] 비밀번호 재설정 인증 코드");
            helper.setText(
                    """
                    안녕하세요, 상급노하우입니다.

                    비밀번호 재설정 인증 코드를 알려드립니다.

                    인증 코드: %s

                    해당 코드는 10분간 유효합니다.
                    본인이 요청하지 않으셨다면 이 메일을 무시해주세요.
                    """
                            .formatted(code));
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new BadRequestException("이메일 전송에 실패했습니다.");
        }
    }
}
