export interface IJwtConfig {
    secret: string;
    expiresIn: string;
    setPasswordExpiryTime: string;
  }

  export interface RequestWithUser {
    user?: any; 
  }