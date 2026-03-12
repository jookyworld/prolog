package com.back.global.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    public void sendPasswordResetCode(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from, "ProLog");
            helper.setTo(to);
            helper.setSubject("[ProLog] 비밀번호 재설정 인증 코드");
            helper.setText("""
                    안녕하세요, ProLog입니다.

                    비밀번호 재설정 인증 코드를 알려드립니다.

                    인증 코드: %s

                    해당 코드는 10분간 유효합니다.
                    본인이 요청하지 않으셨다면 이 메일을 무시해주세요.
                    """.formatted(code));
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("이메일 전송에 실패했습니다.", e);
        }
    }
}
