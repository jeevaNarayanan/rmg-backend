import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { CustomSocket } from 'src/utils/custom-socket.interface';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const client: CustomSocket = context.switchToWs().getClient();
    const token = client.handshake.query?.token;

    if (!token) {
      client.emit('auth_error', { message: 'Authentication token is missing' });
      return false;
    }

    try {
      const decoded = await this.authService.verifyToken(token);
      if (decoded) {
        client.user = decoded
        return true;
      } else {
        client.emit('auth_error', { message: 'Invalid token' });
        return false;
      }
    } catch (error) {
      client.emit('auth_error', { message: 'Invalid token' });
      return false;
    }
  }
}
