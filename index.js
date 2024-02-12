const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

const myMorgan = (tokens,request, response) => {
  morgan.token('postBody', (request,response) =>{
    return tokens.method(request, response) === 'POST'? JSON.stringify(request.body): ''
  } )
  return [
      tokens.method(request, response),
      tokens.url(request, response),
      tokens.status(request, response),
      tokens.res(request, response, 'content-length'), '-',
      tokens['response-time'](request, response), 'ms',
      tokens.postBody(request,response)
      
    ].join(' ')
  
}

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(myMorgan))


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    },
]

app.get('/',(request,response) => {
    response.send('<h1>Hello to PhoneBook backend</h1>')
})

app.get('/info',(request,response) => {

    const actualTime = new Date()

    let responseFromInfo = `<p> PhoneBook has info for ${persons.length} people </p>
        <p> ${actualTime}</p>`
        
    response.send(responseFromInfo)
})

app.get('/api/persons',(request,response)=> {
    response.json(persons)
})

app.get('/api/persons/:id',(request,response) => {
  const id = Number(request.params.id)

  const person = persons.find(person => person.id === id)

  if(person){
    response.json(person)
  }else{
    response.status(404).end()
  }
})

app.delete('/api/persons/:id',(request,response) => {
  const id =  Number(request.params.id)

  const person = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  return Math.floor(Math.random()*100000);
}

app.post('/api/persons',(request,response) => {
  const body = request.body
  
  if(!body.name || !body.number){
    return response.status(400).json({
      error:"Content Missing"
    })
  }

  const nameExists = persons.find(person =>  person.name === body.name)

  if(nameExists){
    return response.status(400).json({
      error: "name must be unique"
    })
  }

  const person = {
    id:generateId(),
    name: body.name,
    number:body.number,
  }

  persons = persons.concat(person)


  response.json(person)

})

const PORT = 3001
app.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`)
})