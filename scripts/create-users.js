const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const users = [
  { firstName: 'John', lastName: 'Troup', randomNum: 4872 },
  { firstName: 'Matt', lastName: 'White', randomNum: 9153 },
  { firstName: 'Nick', lastName: 'Hafften', randomNum: 7284 },
  { firstName: 'Steve', lastName: 'Nelson', randomNum: 3967 },
  { firstName: 'Nick', lastName: 'Deloia', randomNum: 8541 },
  { firstName: 'Jenn', lastName: 'Doucette', randomNum: 2096 },
  { firstName: 'Dana', lastName: 'Rutscher', randomNum: 6413 },
  { firstName: 'Shefali', lastName: 'Pandey', randomNum: 9750 },
  { firstName: 'Whitney', lastName: 'Palmerton', randomNum: 1638 }
]

async function createUsers() {
  try {
    console.log('Creating user accounts...')
    
    for (const user of users) {
      const username = `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}`
      const password = `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}.${user.randomNum}`
      const email = `${username}@company.com`
      const name = `${user.firstName} ${user.lastName}`
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      try {
        const createdUser = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            role: 'USER'
          }
        })
        
        console.log(`✓ Created user: ${name}`)
        console.log(`  Username: ${username}`)
        console.log(`  Email: ${email}`)
        console.log(`  Password: ${password}`)
        console.log(`  ID: ${createdUser.id}`)
        console.log('')
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`! User ${name} already exists, skipping...`)
        } else {
          console.error(`Error creating user ${name}:`, error)
        }
      }
    }
    
    console.log('User creation complete!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUsers()