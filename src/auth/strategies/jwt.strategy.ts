// strategies/jwt.strategy.ts

import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import jwtConfig from "src/config/jwt.config";
import { AuthJwtPayload } from "src/types/auth.jwtPayload";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>
  ){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret
    });
  }

  validate(payload: AuthJwtPayload) {
    return { id: payload.sub, role: payload.role }
  }

}