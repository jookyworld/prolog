# 프로덕션 롤백 절차

배포 후 문제가 발생했을 때 이전 버전으로 되돌리는 절차.

## 사전 조건

- EC2 SSH 접속 가능
- 이전 배포의 커밋 SHA를 알고 있어야 함 (GitHub Actions 배포 히스토리 또는 `docker images`에서 확인)

## 1. EC2 접속

```bash
ssh -i <key-file> <username>@<ec2-host>
```

## 2. 현재 상태 확인 및 이전 이미지 태그 찾기

```bash
# 현재 실행 중인 컨테이너 확인
sudo docker ps

# 사용 가능한 이미지 태그 목록 확인
sudo docker images jookyworld/prolog-backend
```

출력 예시:
```
REPOSITORY                     TAG              IMAGE ID       CREATED        SIZE
jookyworld/prolog-backend      latest           abc123...      5 minutes ago  250MB
jookyworld/prolog-backend      sha-a1b2c3d...   def456...      2 hours ago    250MB
jookyworld/prolog-backend      sha-e4f5g6h...   ghi789...      1 day ago      250MB
```

로컬에 이전 이미지가 없다면 Docker Hub에서 직접 pull:
```bash
sudo docker pull jookyworld/prolog-backend:sha-<이전커밋SHA>
```

## 3. 롤백 실행

```bash
cd ~/app

# 현재 앱 컨테이너 중지
sudo docker-compose -f docker-compose.prod.yml stop spring-app

# 이전 SHA 태그로 컨테이너 실행
sudo docker-compose -f docker-compose.prod.yml run -d --name prolog-backend \
  --service-ports spring-app \
  jookyworld/prolog-backend:sha-<이전커밋SHA>
```

또는 `docker-compose.prod.yml`의 이미지 태그를 직접 수정:
```bash
# docker-compose.prod.yml에서 이미지 태그 변경
sed -i 's|jookyworld/prolog-backend:latest|jookyworld/prolog-backend:sha-<이전커밋SHA>|' docker-compose.prod.yml

# 재기동
sudo docker-compose -f docker-compose.prod.yml up -d spring-app
```

## 4. 헬스체크 확인

```bash
# 앱이 정상 응답하는지 확인
curl -f http://localhost:8080/actuator/health

# 응답 예시: {"status":"UP"}
```

## 5. 롤백 후 조치

1. 문제 원인 파악 → 수정 커밋 생성
2. `docker-compose.prod.yml`의 이미지 태그를 `latest`로 원복 (수동으로 변경했다면)
3. 수정 완료 후 정상 배포 파이프라인으로 재배포
