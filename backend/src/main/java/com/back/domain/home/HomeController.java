package com.back.domain.home;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetAddress;
import java.net.UnknownHostException;

import static java.net.InetAddress.getLocalHost;
import static org.springframework.http.MediaType.TEXT_HTML_VALUE;

@RestController
@RequiredArgsConstructor
public class HomeController {

    @GetMapping(produces = TEXT_HTML_VALUE)
    public String home() throws UnknownHostException {
        InetAddress localHost = getLocalHost();

        return """
                <h1>API 서버</h1>
                <p>Host Name: %s</p>
                <p>Host Address: %s</p>
                <div>
                    <a href="/swagger-ui/index.html">API 문서로 이동</a>
                </div>
                """.formatted(localHost.getHostName(), localHost.getHostAddress());
    }
}
