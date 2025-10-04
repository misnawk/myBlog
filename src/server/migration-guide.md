# 데이터베이스 마이그레이션 가이드

## 1. 직접 SQL 실행 (추천)

MySQL 클라이언트나 phpMyAdmin에서 다음 SQL을 실행하세요:

```sql
-- users 테이블에 role 컬럼 추가
ALTER TABLE users 
ADD COLUMN role ENUM('user', 'admin', 'moderator') 
DEFAULT 'user' 
NOT NULL;

-- 기존 사용자들 기본 role 설정
UPDATE users SET role = 'user' WHERE role IS NULL;

-- 관리자 계정 생성 (본인 이메일로 변경)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 2. 컬럼 추가 확인

```sql
-- 테이블 구조 확인
DESCRIBE users;

-- 데이터 확인
SELECT id, username, email, role FROM users;
```

## 3. 관리자 계정 추가 생성

```sql
-- 추가 관리자 계정 생성
UPDATE users SET role = 'admin' WHERE username = 'admin';

-- 모더레이터 계정 생성
UPDATE users SET role = 'moderator' WHERE email = 'moderator@example.com';
```

## 4. 롤백 (필요시)

```sql
-- role 컬럼 제거 (롤백)
ALTER TABLE users DROP COLUMN role;
```
