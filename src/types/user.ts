export interface AddUserInput {
  input: {
    name: string,
    password: string,
    email: string
  }
}

export interface EditUserInput {
  input: {
    name: string,
    age: number,
  }
}

export interface LoginInput {
  input: {
    email: string
    password: string,
  }
}
