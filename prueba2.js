import express from 'express'
import jwt from 'jsonwebtoken'
import db from './db/connection.js'
import Producto from './models/producto.js'
import Usuario from './models/usuario.js'

const html = '<h1>Bienvenido a la API</h1><p>Los comandos disponibles son:</p><ul><li>GET: /productos/</li><li>GET: /productos/id</li>    <li>POST: /productos/</li>    <li>DELETE: /productos/id</li>    <li>PUT: /productos/id</li>    <li>PATCH: /productos/id</li>    <li>GET: /usuarios/</li>    <li>GET: /usuarios/id</li>    <li>POST: /usuarios/</li>    <li>DELETE: /usuarios/id</li>    <li>PUT: /usuarios/id</li>    <li>PATCH: /usuarios/id</li></ul>'

const app = express()

const exposedPort = 1234

app.use(express.json())

function autenticacionDeToken (req, res, next) {
  const headerAuthorization = req.headers[' authorization ']

  const tokenRecibido = headerAuthorization.split(' ')[1]

  if (tokenRecibido == null) {
    return res.status(401).json({ message: 'Token inválido' })
  }

  let payload = null

  try {
    payload = jwt.verify(tokenRecibido, process.env.SECRET_KEY)
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' })
  }

  if (Date.now() > payload.exp) {
    return res.status(401).json({ message: 'Token caducado' })
  }

  req.user = payload.sub

  next()
}

app.get('/', (req, res) => {
  res.status(200).send(html)
})

app.post('/auth', async function (request, response) {
  const usuarioABuscar = request.body.usuario
  const passwordRecibido = request.body.password

  let usuarioEncontrado = ''
  console.log(passwordRecibido)
  try {
    usuarioEncontrado = await Usuario.findAll({ where: { usuario: usuarioABuscar } })
    if (usuarioEncontrado === '') { return response.status(400).json({ message: 'Usuario no encontrado' }) }
    if (usuarioEncontrado[0].password !== passwordRecibido) {
      return response.status(400).json({ message: 'Password incorrecto' })
    }
  } catch (error) {
    return response.status(400).json({ message: 'Usuario no encontrado' })
  }

  const sub = usuarioEncontrado[0].id
  const usuario = usuarioEncontrado[0].usuario
  const nivel = usuarioEncontrado[0].nivel

  const token = jwt.sign({
    sub,
    usuario,
    nivel,
    exp: Date.now() + (60 * 1000)
  }, process.env.SECRET_KEY)

  response.status(200).json({ accessToken: token })
})

app.get('/productos/', async (req, res) => {
  try {
    const allProducts = await Producto.findAll()
    res.status(200).json(allProducts)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.get('/productos/:id', async (req, res) => {
  try {
    const productoId = parseInt(req.params.id)
    const productoEncontrado = await Producto.findByPk(productoId)

    res.status(200).json(productoEncontrado)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.post('/productos', autenticacionDeToken, async (req, res) => {
  try {
    const productoAGuardar = new Producto(req.body)
    await productoAGuardar.save()
    res.status(201).json({ message: 'success' })
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.patch('/productos/:id', async (req, res) => {
  const idProductoAEditar = parseInt(req.params.id)
  try {
    const productoAActualizar = await Producto.findByPk(idProductoAEditar)

    if (!productoAActualizar) {
      return res.status(204).json({ message: 'Producto no encontrado' })
    }
    await productoAActualizar.update(req.body)
    res.status(200).send('Producto actualizado')
  } catch (error) {
    res.status(204).json({ message: 'Producto no encontrado' })
  }
})

app.delete('/productos/:id', async (req, res) => {
  const idProductoABorrar = parseInt(req.params.id)
  try {
    const productoABorrar = await Producto.findByPk(idProductoABorrar)
    if (!productoABorrar) {
      return res.status(204).json({ message: 'Producto no encontrado' })
    }

    await productoABorrar.destroy()
    res.status(200).json({ message: 'Producto borrado' })
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.use((req, res) => {
  res.status(404).send('<h1>404</h1>')
})

try {
  await db.authenticate()
  console.log('Connection has been established successfully.')
} catch (error) {
  console.error('Unable to connect to the database:', error)
}
app.listen(exposedPort, () => {
  console.log('Servidor escuchando en http://localhost:' + exposedPort)
})
