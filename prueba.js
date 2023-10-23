import express from 'express'

const app = express()

// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json())

app.post('/auth', (request, response) => {
  // Accede a los datos del cuerpo de la solicitud
  const usuario = request.body.usuario
  const password = request.body.password

  // Respuesta de ejemplo
  response.json({ usuario, password })
})

const port = 3000 // Puerto en el que escuchará el servidor

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`)
})
