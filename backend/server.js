const express = require('express')
const dotenv = require('dotenv').config()
const {errorHandler} = require('./middleware/errorMiddleware')
const port = process.env.PORT || 8000


//Inicializar express
const app = express()

//Middleware -> Software que actua de intermediario entre componentes
//Middleware para poder leer los cuerpos de las peticiones
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//Peticiones que hemos declarado
app.use('/api/goals', require('./routes/goalRoutes'))

//Middleware para tratar los errores, tiene que ir después de las peticiones?
app.use(errorHandler)

//Random
app.listen(port, () => console.log(`Server started on port ${port}`))