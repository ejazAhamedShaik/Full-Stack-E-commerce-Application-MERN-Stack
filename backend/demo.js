import express from 'express'

const app = express()

app.use(express.json())

app.use((req, res, next) => {
  console.log("Middleware 1");
  next();
});