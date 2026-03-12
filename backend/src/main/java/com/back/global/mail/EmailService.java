package com.back.global.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    public void sendPasswordResetCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("[ProLog] 비밀번호 재설정 인증 코드");
        message.setText("""
                안녕하세요, ProLog입니다.

                비밀번호 재설정 인증 코드를 알려드립니다.

                인증 코드: %s

                해당 코드는 10분간 유효합니다.
                본인이 요청하지 않으셨다면 이 메일을 무시해주세요.
                """.formatted(code));
        mailSender.send(message);
    }
}
