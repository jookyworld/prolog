# 1단계: 빌드
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# 캐시 효율을 위해 종속성 관련 파일 먼저 복사
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
RUN chmod +x gradlew

# 빌드 캐시 활용을 위해 라이브러리 먼저 다운로드
RUN ./gradlew dependencies --no-daemon

COPY src ./src
# plain.jar 생성 방지 및 빌드
RUN ./gradlew bootJar -x test --no-daemon

# 2단계: 실행
FROM eclipse-temurin:21-jre
WORKDIR /app

# JAR 복사
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV TZ=Asia/Seoul

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Duser.timezone=Asia/Seoul", "/app/app.jar"]