const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { env } = require('./config/env')
const healthRoute = require('./routes/health')
const dashboardRoute = require('./routes/dashboard')
const repaymentsRoute = require('./routes/repayments')
const educationRoute = require('./routes/education')

const app = express()

app.use(helmet())
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',') }))
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/health', healthRoute)
app.use('/api/dashboard', dashboardRoute)
app.use('/api/repayments', repaymentsRoute)
app.use('/api/education', educationRoute)

app.use((err, _req, res, _next) => {
  // Keep internal errors out of the client response.
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = { app }
