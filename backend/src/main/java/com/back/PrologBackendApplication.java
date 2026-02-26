package com.back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PrologBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PrologBackendApplication.class, args);
	}

}
