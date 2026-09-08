import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoute from './routes/authRoute.js'
import patientRoute from './routes/patientRoute.js'
import poliRoute from './routes/poliRoute.js'
import registrationRoute from './routes/registrationRoute.js'
import medicalRecordRoute from './routes/medicalRecordRoute.js'
import userRoute from './routes/userRoute.js'
import { stats } from './controllers/dashboardController.js'
import { authenticate } from './middleware/auth.js'
import { failure } from './utils/response.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/auth', authRoute)
app.use('/api/patients', patientRoute)
app.use('/api/polis', poliRoute)
app.use('/api/registrations', registrationRoute)
app.use('/api/medical-records', medicalRecordRoute)
app.use('/api/users', userRoute)
app.get('/api/dashboard', authenticate, stats)

app.use((req, res) => failure(res, 'Route not found', 404))
app.use((err, req, res, next) => {
  console.error(err)
  failure(res, err.message || 'Internal Server Error', 500)
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`BE running on port ${port}`))
