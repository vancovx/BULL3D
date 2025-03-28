const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const {errorHandler} = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const port = process.env.PORT || 8000

connectDB()

//Inicializar express
const app = express()

//Middleware -> Software que actua de intermediario entre componentes
//Middleware para poder leer los cuerpos de las peticiones
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//Peticiones que hemos declarado
app.use('/api/goals', require('./routes/goalRoutes'))
app.use('/api/users', require('./routes/userRoutes'))

// Serve frontend
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
  
    app.get('*', (req, res) =>
      res.sendFile(
        path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
      )
    );
} else {
    app.get('/', (req, res) => res.send('Please set to production'));
}


//Middleware para tratar los errores, tiene que ir después de las peticiones?
app.use(errorHandler)

//Random
app.listen(port, () => console.log(`Server started on port ${port}`))