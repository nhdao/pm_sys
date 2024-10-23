export interface IUser {
  id: string
  name: string
  email: string,
  department: {
    id:string,
    name:string
  }
  role: {
    id: string,
    name: string;
  }
}