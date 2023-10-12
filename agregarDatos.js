import { createRequire } from 'node:module'
import Usuario from './models/usuario.js'
import Producto from './models/producto.js'

const require = createRequire(import.meta.url)
const datos = require('./datos.json')
const listaU = []
const listaP = []

for (const e in datos) {
  for (const x in e) {
    if (e === 'usuarios') {
      const uId = datos[e][x].id
      const uNom = (datos[e][x].nombre)
      const uEdad = (datos[e][x].edad)
      const uEmail = (datos[e][x].email)
      const uTel = (datos[e][x].telefono)
      listaU.push(new Usuario(uId, uNom, uEdad, uEmail, uTel))
    } else if (e === 'productos') {
      const pId = (datos[e][x].id)
      const pNom = (datos[e][x].nombre)
      const pTipo = (datos[e][x].tipo)
      const pPrecio = (datos[e][x].precio)
      listaP.push(new Producto(pId, pNom, pTipo, pPrecio))
    }
  }
}
