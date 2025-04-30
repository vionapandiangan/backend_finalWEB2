export class JwtPayloadDto {
  sub: number;

  email: string;

  role: string;

  iat?: number;

  exp?: number;
}