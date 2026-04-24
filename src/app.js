const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { env } = require('./config/env')
const healthRoute = require('./routes/health')
const dashboardRoute = require('./routes/dashboard')
const repaymentsRoute = require('./routes/repayments')
const educationRoute = require('./routes/education')
const integrationsWendiRoute = require('./routes/integrationsWendi')

const app = express()
const allowedOrigins = env.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (env.corsOrigin === '*' || !origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    },
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/health', healthRoute)
app.use('/api/dashboard', dashboardRoute)
app.use('/api/repayments', repaymentsRoute)
app.use('/api/education', educationRoute)
app.use('/api/integrations/wendi', integrationsWendiRoute)

app.use((err, _req, res, _next) => {
  // Keep internal errors out of the client response.
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = { app }
