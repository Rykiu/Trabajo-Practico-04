import express from 'express'
import jwt from 'jsonwebtoken'
import db from './db/connection.js'
import Producto from './models/producto.js'
import Usuario from './models/usuario.js'

const html = '<h1>Bienvenido a la API</h1>'

const app = express()

const exposedPort = 1234

app.use(express.json())

function authenticateToken (req, res, next) {
  const tokenRecibido = req.headers.authorization.split(' ')[1]

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
    exp: Date.now() + (60 * 10000)
  }, process.env.SECRET_KEY)

  response.status(200).json({ accessToken: token })
})

app.get('/usuarios/', async (req, res) => {
  try {
    const allUsuarios = await Usuario.findAll()
    res.status(200).json(allUsuarios)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id)
    const usuarioEncontrado = await Usuario.findByPk(usuarioId)
    res.status(200).json(usuarioEncontrado)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.post('/usuarios', authenticateToken, async (req, res) => {
  const { dni, nombres, apellidos, email, telefono, usuario, password, nivel } = req.body

  try {
    const nuevoUsuario = await Usuario.create({
      dni,
      nombres,
      apellidos,
      email,
      telefono,
      usuario,
      password,
      nivel
    })
    res.status(201).json(nuevoUsuario)
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el Usuario' })
  }
})

app.patch('/usuarios/:id', authenticateToken, async (req, res) => {
  const datos = req.body
  const usuarioId = req.params.id

  try {
    // Verificar si el producto existe
    const usuarioAModificar = await Usuario.findByPk(usuarioId)
    if (!usuarioAModificar) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Actualizar los campos del producto
    usuarioAModificar.dni = datos.dni || usuarioAModificar.dni
    usuarioAModificar.nombres = datos.nombres || usuarioAModificar.nombres
    usuarioAModificar.apellidos = datos.apellidos || usuarioAModificar.apellidos
    usuarioAModificar.email = datos.email || usuarioAModificar.email
    usuarioAModificar.telefono = datos.telefono || usuarioAModificar.telefono
    usuarioAModificar.usuario = datos.usuario || usuarioAModificar.usuario
    usuarioAModificar.password = datos.password || usuarioAModificar.password
    usuarioAModificar.nivel = datos.nivel || usuarioAModificar.nivel

    // Guardar los cambios en la base de datos
    await usuarioAModificar.save()

    res.json(usuarioAModificar)
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el producto' })
  }
})

app.delete('/usuarios/:id', authenticateToken, async (req, res) => {
  const idUsuarioBorrar = parseInt(req.params.id)
  try {
    const usuarioBorrar = await Usuario.findByPk(idUsuarioBorrar)
    if (!usuarioBorrar) {
      return res.status(204).json({ message: 'Usuario no encontrado' })
    }
    await usuarioBorrar.destroy()
    res.status(200).json({ message: 'Usuario borrado' })
  } catch (error) {
    res.status(240).json({ Message: 'error' })
  }
})

app.get('/productos/precio/:id', async (req, res) => {
  try {
    const productoId = parseInt(req.params.id)
    const productoEncontrado = await Producto.findByPk(productoId)
    res.status(200).json(productoEncontrado.precio)
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
})

app.get('/productos/nombre/:id', async (req, res) => {
  try {
    const productoId = parseInt(req.params.id)
    const productoEncontrado = await Producto.findByPk(productoId)
    res.status(200).json(productoEncontrado.nombre)
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
})

app.get('/usuarios/telefono/:id', async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id)
    const usuarioEncontrado = await Usuario.findByPk(usuarioId)
    res.status(200).json(usuarioEncontrado.telefono)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.get('/usuarios/nombre/:id', async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id)
    const usuarioEncontrado = await Usuario.findByPk(usuarioId)
    res.status(200).json(usuarioEncontrado.nombres)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.get('/productos/stock', async (req, res) => {
  try {
    let sumaPrecios = 0
    let stock = 0
    const allProductos = await Producto.findAll()
    allProductos.forEach(function (producto) {
      sumaPrecios += producto.precio
      stock++
    })
    sumaPrecios = sumaPrecios.toFixed(2)
    res.status(200).send('Stock total de productos: ' + stock + '\nSuma de precios: ' + sumaPrecios)
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
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
