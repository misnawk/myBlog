# 최적화된 Dockerfile - Jenkins 빌드 결과물 활용
FROM node:18-alpine

WORKDIR /app

# 서버 의존성만 설치 (이미 빌드된 상태)
COPY src/server/package*.json ./src/server/
RUN cd src/server && npm ci --only=production --prefer-offline --no-audit

# 빌드된 클라이언트 파일 복사
COPY src/client/build ./src/client/build

# 빌드된 서버 파일 복사
COPY src/server/dist ./src/server/dist

# 환경 변수 설정
ENV NODE_ENV=production

# 포트 노출 - Docker Compose에서 3000으로 매핑하므로 3000으로 변경
EXPOSE 3000

# 서버 시작
CMD ["node", "src/server/dist/main"]