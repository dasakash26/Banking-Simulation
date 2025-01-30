import { EmploymentType, AccountType, LoanType, InvestmentType, TransactionMode, TransactionStatus, Branch, User } from '@prisma/client'
import prisma from '../src/lib/prisma'

// Realistic data arrays
const firstNames = [
    'Akash','Tanish','Anwesha','Aarav','Aaradhya','Aarush',
  'Aditya', 'Priya', 'Rahul', 'Neha', 'Amit', 'Sneha', 'Vikram', 'Pooja',
  'Raj', 'Anjali', 'Arjun', 'Deepa', 'Karthik', 'Meera', 'Suresh', 'Kavita',
  'Mohit', 'Riya', 'Sanjay', 'Divya'
]

const lastNames = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Verma', 'Gupta', 'Shah', 'Reddy',
  'Joshi', 'Malhotra', 'Mehta', 'Kapoor', 'Iyer', 'Nair', 'Rao', 'Das',
  'Banerjee', 'Mukherjee', 'Chatterjee', 'Sinha', 
]

type CitiesMap = {
  [state: string]: string[]
}

const cities: CitiesMap = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Delhi': ['New Delhi', 'Delhi', 'Noida', 'Gurgaon', 'Faridabad']
}

const streets = [
  'M.G. Road', 'S.V. Road', 'Park Street', 'Brigade Road', 'Commercial Street',
  'Link Road', 'Hill Road', 'Church Street', 'Main Street', 'Gandhi Road'
]

const companies = [
  'TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra',
  'Reliance', 'HDFC Bank', 'ICICI Bank', 'Airtel', 'ITC',
  'Hindustan Unilever', 'Asian Paints', 'L&T', 'Axis Bank', 'SBI'
]

// Helper functions with type annotations
const generatePAN = (index: number): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${index.toString().padStart(4, '0')}${letters[Math.floor(Math.random() * 26)]}${index % 10}`
}

const generateMobile = (): string => {
  return `${['6', '7', '8', '9'][Math.floor(Math.random() * 4)]}${Math.random().toString().slice(2, 11)}`
}

const generateAccountNumber = (index: number): string => {
  return `2023${Math.random().toString().slice(2, 12)}`
}

const generateEmail = (firstName: string, lastName: string): string => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
  const randomNum = Math.floor(Math.random() * 1000)
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${domains[Math.floor(Math.random() * domains.length)]}`
}

const randomAmount = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  // Type assertion for enum access
  const employmentTypes = Object.values(EmploymentType) as EmploymentType[]
  const investmentTypes = Object.values(InvestmentType) as InvestmentType[]
  const loanTypes = Object.values(LoanType) as LoanType[]

  // Create branches with realistic data
  const branches = await Promise.all(
    Array.from({ length: 10 }, (_, i) => {
      const state = Object.keys(cities)[i % Object.keys(cities).length]
      const city = cities[state][Math.floor(Math.random() * cities[state].length)]
      const code = `BR${(i + 1).toString().padStart(4, '0')}`
      return prisma.branch.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: `${city} ${streets[Math.floor(Math.random() * streets.length)]} Branch`,
          address: `${Math.floor(Math.random() * 100) + 1}, ${streets[Math.floor(Math.random() * streets.length)]}`,
          city,
          state,
          ifscCode: `DBANK${(i + 1).toString().padStart(4, '0')}`
        }
      })
    })
  )

  // Reduce batch size to prevent connection issues
  const BATCH_SIZE = 50
  const TOTAL_USERS = 1000

  // Process users sequentially in smaller batches
  for (let batch = 0; batch < TOTAL_USERS / BATCH_SIZE; batch++) {
    try {
      // Create users with realistic data
      for (let i = 0; i < BATCH_SIZE; i++) {
        const index = batch * BATCH_SIZE + i
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        const fullName = `${firstName} ${lastName}`
        
        const user = await prisma.user.upsert({
          where: { pan: generatePAN(index) },
          update: {},
          create: {
            pan: generatePAN(index),
            name: fullName,
            mobile: generateMobile(),
            email: generateEmail(firstName, lastName),
            dob: new Date(
              1960 + Math.floor(Math.random() * 40),
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28)
            ),
            employmentType:
              employmentTypes[
                Math.floor(Math.random() * employmentTypes.length)
              ],
            salary: [
              35000, 45000, 55000, 65000, 75000, 85000, 95000, 125000, 150000,
              200000,
            ][Math.floor(Math.random() * 10)],
            kycComplete: Math.random() > 0.1,
          },
        });

        // Create account with realistic balances
        const randomBranch = branches[Math.floor(Math.random() * branches.length)]
        await prisma.bankAccount.create({
          data: {
            userId: user.id,
            accountNumber: generateAccountNumber(index),
            type: Math.random() > 0.3 ? AccountType.SAVINGS : AccountType.CURRENT,
            ifscCode: randomBranch.ifscCode,
            branchCode: randomBranch.code,
            balance: Math.floor(Math.random() * 5) * 100000 + 10000, // More realistic balance distribution
            nomineeName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            nomineeRelation: ['Spouse', 'Parent', 'Child', 'Sibling'][Math.floor(Math.random() * 4)]
          }
        })

        // Create investment (30% chance)
        if (Math.random() > 0.7) {
          await prisma.investment.create({
            data: {
              userId: user.id,
              type: investmentTypes[Math.floor(Math.random() * investmentTypes.length)],
              amount: randomAmount(10000, 500000),
              currentValue: randomAmount(10000, 600000),
              interestRate: randomAmount(5, 15),
              maturityDate: new Date(2024 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1)
            }
          })
        }

        // Create loan (20% chance)
        if (Math.random() > 0.8) {
          const account = await prisma.bankAccount.findFirst({ where: { userId: user.id } })
          if (account) {
            await prisma.loan.create({
              data: {
                accountId: account.id,
                userId: user.id,
                type: loanTypes[Math.floor(Math.random() * loanTypes.length)],
                amount: randomAmount(100000, 5000000),
                emi: randomAmount(5000, 50000),
                startDate: new Date(),
                tenureMonths: [12, 24, 36, 60, 120, 240][Math.floor(Math.random() * 6)],
                remainingAmount: randomAmount(100000, 5000000),
                interestRate: randomAmount(7, 15),
                purpose: ['Home', 'Business', 'Education', 'Personal'][Math.floor(Math.random() * 4)]
              }
            })
          }
        }
      }

      console.log(`Processed batch ${batch + 1} of ${TOTAL_USERS / BATCH_SIZE}`)
      
      // Add a small delay between batches to allow connections to close
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error processing batch ${batch}:`, error)
      throw error
    }
  }

  console.log('Database has been seeded successfully')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
