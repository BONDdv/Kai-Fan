const express = require('express');
const morgan = require('morgan');
const app = express();
const {readdirSync} = require('fs')
const cors = require('cors')

// const authRouter = require('./routes/auth')
// const categoryRouter = require('./routes/category')

app.use(morgan('dev'));
app.use(express.json({limit: '20mb'}));
app.use(cors());

// app.use('/api',authRouter)
// app.use('/api',categoryRouter)
readdirSync('./routes')
.map((c)=> app.use('/api', require('./routes/'+c)))


app.listen(9000, ()=>console.log('Server is on 9000'))