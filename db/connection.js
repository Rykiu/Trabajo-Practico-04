import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOSTNAME,
    dialect: process.env.DB_DIALECT,
    loggin: true
  }
)

export default db
