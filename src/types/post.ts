export interface AddPostInput {
  input: {
    title: string,
    body: string,
    user_id: number,
  }
}

export interface UpdatePostInput {
  input: {
    id: number,
    title: string,
    body: string,
  }
}

