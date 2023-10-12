import { Sequelize } from 'sequelize'

const db = new Sequelize(
  'psswyrio',
  'psswyrio',
  'bUqSGkd0WBU4O7-46N3V1POoiglbyMoH',
  {
    host: 'silly.db.elephantsql.com',
    dialect: 'postgres',
    loggin: 'true'
  })

export default db
