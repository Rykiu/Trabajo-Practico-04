import { createRequire } from 'node:module'
import express from 'express'

const require = createRequire(import.meta.url)

const datos = require('./datos.json')

const app = express()

const expossedPort = 1234

app.get('/', (req, res) => {
  res.status(200).send('<h1>Bienvenido a la API</h1>')
})

app.get('/usuarios/', (req, res) => {
  try {
    const obtUsuarios = datos.usuarios
    res.status(200).json(obtUsuarios)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.get('/usuarios/:id', (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id)
    const usuarioEncontrado = datos.usuarios.find((usuario) => usuario.id === usuarioId)
    res.status(200).json(usuarioEncontrado)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.get('/usuarios/telefono/:id', (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id)
    const usuarioEncontrado = datos.usuarios.find((usuario) => usuario.id === usuarioId)
    res.status(200).json(usuarioEncontrado.telefono)
  } catch (error) {
    res.status(204).json({ message: error })
  }
})

app.get('/usuarios/nombre/:id', (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id)
    const usuarioEncontrado = datos.usuarios.find((usuario) => usuario.id === usuarioId)
    res.status(200).json(usuarioEncontrado.nombre)
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
    req.on('end', () => {
      const data = JSON.parse(bodyTemp)
      req.body = data
      datos.usuarios.push(req.body)
    })
    res.status(201).json({ message: 'success' })
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
})

app.patch('/usuarios/:id', (req, res) => {
  const idUsuarioAEditar = parseInt(req.params.id)
  const usuarioAActualizar = datos.usuarios.find((usuario) => usuario.id === idUsuarioAEditar)
  if (!usuarioAActualizar) {
    res.status(204).json({ message: 'Producto no encontrado' })
  }
  let bodyTemp = ''
  req.on('data', (chunk) => {
    bodyTemp += chunk.toString()
  })
  req.on('end', () => {
    const data = JSON.parse(bodyTemp)
    req.body = data
    if (data.nombre) {
      usuarioAActualizar.nombre = data.nombre
    }
    if (data.edad) {
      usuarioAActualizar.edad = data.edad
    }
    if (data.email) {
      usuarioAActualizar.email = data.email
    }
    res.status(200).send('Producto actualizado')
  })
})

app.delete('/usuarios/:id', (req, res) => {
  const idUsuarioABorrar = parseInt(req.params.id)
  const usuarioABorrar = datos.usuarios.find((usuario) => usuario.id === idUsuarioABorrar)

  if (!usuarioABorrar) {
    res.status(204).json({ message: 'Usuario no encontrado' })
  }

  const indiceUsuarioABorrar = datos.usuarios.indexOf(usuarioABorrar)
  try {
    datos.usuarios.splice(indiceUsuarioABorrar, 1)
    res.status(200).json({ message: 'success' })
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
})

app.get('/productos/precio/:id', (req, res) => {
  try {
    const productoId = parseInt(req.params.id)
    const productoEncontrado = datos.productos.find((producto) => producto.id === productoId)
    res.status(200).json(productoEncontrado.precio)
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
})

app.get('/productos/nombre/:id', (req, res) => {
  try {
    const productoId = parseInt(req.params.id)
    const productoEncontrado = datos.productos.find((producto) => producto.id === productoId)
    res.status(200).json(productoEncontrado.nombre)
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
})

app.get('/productos/stock', (req, res) => {
  try {
    let sumaPrecios = 0
    let stock = 0
    datos.productos.forEach(function (producto) {
      sumaPrecios += producto.precio
      stock++
    })
    sumaPrecios = sumaPrecios.toFixed(2)
    res.status(200).send('Stock total de productos: ' + stock + '\nSuma de precios: ' + sumaPrecios)
  } catch (error) {
    res.status(204).json({ message: 'error' })
  }
})

app.use((req, res) => {
  res.status(404).send('404')
})

app.listen(expossedPort, () => {
  console.log('Servidor escuchando en http://localhost' + expossedPort)
})
