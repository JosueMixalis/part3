const express = require('express')
const app = express()
require('dotenv').config()
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors')


app.use(express.static('dist'))

const myMorgan = (tokens,request, response) => {
  morgan.token('postBody', (request,response) => {
    return tokens.method(request, response) === 'POST'? JSON.stringify(request.body): ''
  } )
  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    tokens.postBody(request,response)]
    .join(' ')
}

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}



const errorHandler= (error,request,response,next) => {

  if(error.name === 'CastError') {
    return response.status(404).send({ error: 'malformatted id' })
  }
  if(error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}


app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(morgan(myMorgan))



app.get('/',(request,response) => {
  response.send('<h1>Hello to PhoneBook backend</h1>')
})

app.get('/info',(request,response) => {

  const actualTime = new Date()
  /* let responseFromInfo = `<p> PhoneBook has info for ${persons.length} people </p>
        <p> ${actualTime}</p>`*/
  response.send(' <p>Working in it <p> ')
})

app.get('/api/persons',(request,response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id',(request,response,next) => {

  Person.findById(request.params.id)
    .then(person => {
      console.log(person)
      if(person){
        response.json(person)
      }else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))

})

app.delete('/api/persons/:id',(request,response,next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(res => {
      response .status(204).send()
    })
    .catch(error => next(error))

})

app.post('/api/persons',(request,response,next) => {
  const body = request.body

  if(body.name === undefined || body.number === undefined){
    return response.status(400).json({ error: 'content missing' })
  }


  const person = new Person({
    name: body.name,
    number:body.number,
  })


  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))


})

app.put('/api/persons/:id',(request,response,next) => {
  const body = request.body

  if(body.name === undefined || body.number === undefined){
    return response.status(400).json({ error: 'content missing' })
  }

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new:true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))

})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT,() => {
  console.log(`Server running on port ${PORT}`)
})