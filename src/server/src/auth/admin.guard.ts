import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../user/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log("=== 관리자 권한 확인 ===");
    console.log("사용자 정보:", user);
    console.log("사용자 역할:", user?.role);

    if (!user) {
      console.log("인증되지 않은 사용자");
      throw new ForbiddenException('인증이 필요합니다.');
    }

    if (user.role !== UserRole.ADMIN) {
      console.log("관리자 권한 없음");
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    console.log("관리자 권한 확인 완료");
    console.log("=== 관리자 권한 확인 완료 ===");
    return true;
  }
}
