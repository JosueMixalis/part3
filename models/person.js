const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema ({
    name:{
      type:String,
      minlength: 3,
      requiere: true,
    },
    number:String/*{
      type:String,
      minlength:8,
      validate: {
      validator: (v) => {
        return /^(\d{2,3})-[0-9]+/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
      requiere:[true, 'User phone number requiered']
    }*/
})


personSchema.set('toJSON', {
    transform: (document,returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

/*personSchema.statics.findByName = (name,cb) => {
  return this.find({name:name},cb)
}*/

module.exports = mongoose.model('Person',personSchema)