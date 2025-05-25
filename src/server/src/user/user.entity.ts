export class User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;


  constructor(username:string, email:string, password:string, id?: number) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.id = id || 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
