export interface AddUserInput {
  input: {
    name: string,
    age: number,
    password: string,
    email: string
  }
}

export interface LoginInput {
  input: {
    email: string
    password: string,
  }
}
