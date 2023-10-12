import express from 'express'
import db from './db/connection.js'
import Producto from './models/producto.js'
import Usuario from './models/usuario.js'

const app = express()

try {
  await db.authenticate()
  console.log('Se extableció la conexión correctamente')
} catch (error) {
  console.error('Error al conectarse a la base de datos')
}

const expossedPort = 1234

app.listen(expossedPort, () => {
  console.log('Servidor escuchando en http://localhost' + expossedPort)
})

app.get('/', (req, res) => {
  res.status(200).send('<h1>Bienvenido a la API de Ramiro Alzogaray</h1>')
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

app.post('/usuarios', (req, res) => {
  try {
    let bodyTemp = ''

    req.on('data', (chunk) => {
      bodyTemp += chunk.toString()
    })

    req.on('end', async () => {
      const data = JSON.parse(bodyTemp)
      req.body = data
      const guardarUsuario = new Usuario(req.body)
      await guardarUsuario.save()
    })

    res.status(201).json({ message: 'success' })
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
})

app.patch('/usuarios/:id', async (req, res) => {
  const idUsuario = parseInt(req.params.id)
  try {
    const usuarioActualizar = await Usuario.findByPk(idUsuario)
    if (!usuarioActualizar) {
      return res.status(204).json({ message: 'Usuario no encontrado' })
    }
    let bodyTemp = ''

    req.on('data', (chunk) => {
      bodyTemp += chunk.toString()
    })
    req.on('end', async () => {
      const data = JSON.parse(bodyTemp)
      req.body = data

      await usuarioActualizar.update(req.body)

      res.status(200).send('Usuario Actualizado')
    })
  } catch (error) {
    res.status(204).json({ message: 'Usuario no encontrado' })
  }
})

app.delete('/usuarios/:id', async (req, res) => {
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
    res.status(200).json(usuarioEncontrado.nombre)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.get('/productos/stock', async (req, res) => {
  try {
    let sumaPrecios = 0
    let stock = 0
    await Producto.forEach(function (producto) {
      sumaPrecios += Producto.precio
      stock++
    })
    sumaPrecios = sumaPrecios.toFixed(2)
    res.status(200).send('Stock total de productos: ' + stock + '\nSuma de precios: ' + sumaPrecios)
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
})
