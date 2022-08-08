# About crud-test-backend

crud-test-backend is a server integration layer built un-top of of nodejs & typescript as the RestAPI point of connection for crud-test-frontend.

# Requirement

You must have the following packages, applications on your machine:

1.  Postgres.app 
2.  Node
3.  Git

# Getting Started

To clone this project on your local computer, perform the following task:

- Open a terminal on the folder you want to clone this project to

Run the following command to clone this project on your local machine

`git clone https://github.com/johnsonfash/crud-test-backend.git`

- If you have VSCODE installed on your local machine, include the newly cloned folder or run the command below on the currently opened terminal

`cd crud-test-backend`

`code .`

Once the folder is opened on your editor, run the following command in the root of the new folder

`npm install`

# Postgres initialization

Open up the Postgres.app and ensure it started/running

Open the .env file in the root folder and change `<user>` to the name on your computer i.e `john_pc`, `john` etc

In the root of your folder enter the following command

`npx prisma migrate dev`

# Running the app on local machine

After completing the steps above, run the command below to initialise the project

`npm run dev`

You can navigate to `http://localhost:3000/graphql` or any port of your choice to use GraphQL playground