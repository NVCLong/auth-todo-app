import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { jwtSecret } from 'src/untils/constants';
import { Request } from 'express';

const extractFromCookie = (req: Request) => {
  let token: string | null = null;
  if (req && req.cookies) {
    token = req.cookies['refresh'];
  }
  console.log('Token: ' + token);
  return token;
};
@Injectable()
export class RefreshJwttrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      // ExtractJwt.fromBodyField("refresh")
      jwtFromRequest: ExtractJwt.fromExtractors([extractFromCookie]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: { id: number; username: string }) {
    return { id: payload.id, username: payload.username };
  }
}
