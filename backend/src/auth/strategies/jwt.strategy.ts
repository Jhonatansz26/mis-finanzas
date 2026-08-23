import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../models/token.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject('MYSQL') private pool: any) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_KEY || 'no hay',

    });
  }

  async validate(payload: JwtPayload) {
    try {
      
      const [sessions] = await this.pool.query(
        `SELECT session_id, expires_at, is_active 
         FROM sessions 
         WHERE session_id = ? AND user_id = ? AND is_active = true`,
        [payload.sessionId, payload.sub],
      );

      if (!sessions || sessions.length === 0) {
        throw new UnauthorizedException('Sesión no válida');
      }

      const session = sessions[0];

    
      const expiresAt = new Date(session.expires_at);
      const now = new Date();

      if (expiresAt < now) {
        await this.pool.query(
          'UPDATE sessions SET is_active = false WHERE session_id = ?',
          [payload.sessionId],
        );

        throw new UnauthorizedException('Sesión expirada');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.log(error);
      
      throw new UnauthorizedException('Error al validar la sesión');
    }
  }
}