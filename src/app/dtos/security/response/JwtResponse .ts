export class JwtResponse {
  constructor(
    public accessToken: string,
    public username: string,
    public roles: string[],
    public refreshToken?: string
  ) {}
}
