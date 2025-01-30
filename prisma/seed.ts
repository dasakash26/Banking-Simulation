import {
  EmploymentType,
  AccountType,
  LoanType,
  InvestmentType,
  TransactionMode,
  TransactionStatus,
  Branch,
  User,
} from "@prisma/client";
import prisma from "../src/lib/prisma";

// Realistic data arrays
const firstNames = [
  "Aarav", "Arjun", "Advait", "Aditya", "Akshay", "Arnav", "Aryan",
  "Dhruv", "Ishaan", "Kabir", "Krishna", "Vihaan", "Vivaan",
  "Aanya", "Diya", "Ishita", "Kiara", "Myra", "Pari", "Riya",
  "Saanvi", "Siya", "Zara", "Aahana", "Ananya", "Avni",
  "Akash", "Tanish", "Anwesha", "Arya", "Somnath" // Added names
];

const lastNames = [
  "Sharma", "Patel", "Kumar", "Singh", "Verma", "Gupta", "Shah",
  "Reddy", "Joshi", "Malhotra", "Mehta", "Kapoor", "Iyer", "Nair",
  "Rao", "Das", "Banerjee", "Mukherjee", "Chatterjee", "Sinha",
  "Agarwal", "Desai", "Menon", "Pillai", "Saxena", "Trivedi",
  "Das", "Works", "Saha", "Sil", "AWS" // Added names
];

type CitiesMap = {
  [state: string]: string[];
};

const cities: CitiesMap = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  Delhi: ["New Delhi", "Delhi", "Noida", "Gurgaon", "Faridabad"],
};

const streets = [
  "M.G. Road",
  "S.V. Road",
  "Park Street",
  "Brigade Road",
  "Commercial Street",
  "Link Road",
  "Hill Road",
  "Church Street",
  "Main Street",
  "Gandhi Road",
];

const companies = [
  // Add new companies at the beginning
  "Polycab", "AWS",
  // ...existing companies...
  // Tech Companies
  "TCS", "Infosys", "Wipro", "HCL", "Tech Mahindra", "Cognizant", "Accenture",
  // Banks
  "HDFC Bank", "ICICI Bank", "Axis Bank", "SBI", "Kotak Mahindra Bank",
  // Other Corporates
  "Reliance Industries", "ITC Limited", "Hindustan Unilever", "Bharti Airtel",
  "Asian Paints", "L&T", "Adani Group", "Tata Motors", "Mahindra & Mahindra"
];

// Helper functions with type annotations
const generatePAN = (index: number): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // Format: AAAPL1234M
  return `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}P${letters[Math.floor(Math.random() * 26)]}${index.toString().padStart(4, '0')}${letters[Math.floor(Math.random() * 26)]}`;
};

const generateMobile = (): string => {
  return `${["6", "7", "8", "9"][Math.floor(Math.random() * 4)]}${Math.random()
    .toString()
    .slice(2, 11)}`;
};

const generateAccountNumber = (index: number): string => {
  return `2023${Math.random().toString().slice(2, 12)}`;
};

const generateEmail = (firstName: string, lastName: string): string => {
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${
    domains[Math.floor(Math.random() * domains.length)]
  }`;
};

const randomAmount = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateSalary = (employmentType: EmploymentType): number => {
  const baseSalaries = {
    [EmploymentType.EMPLOYED]: { min: 300000, max: 2500000 },
    [EmploymentType.BUSINESS]: { min: 800000, max: 5000000 },
    [EmploymentType.UNEMPLOYED]: { min: 0, max: 100000 }
  };
  
  const { min, max } = baseSalaries[employmentType];
  return Math.floor((Math.random() * (max - min) + min) / 1000) * 1000;
};

const generateAccountBalance = (accountType: AccountType, income: number): number => {
  const minBalance = accountType === AccountType.SAVINGS ? 5000 : 25000;
  const maxMultiplier = accountType === AccountType.SAVINGS ? 24 : 36;
  return Math.floor((Math.random() * (income * maxMultiplier - minBalance) + minBalance) / 100) * 100;
};

// Add function to generate account type with proper distribution
const generateAccountType = (): AccountType => {
  const types = [
    { type: AccountType.SAVINGS, weight: 0.5 },
    { type: AccountType.CURRENT, weight: 0.2 },
    { type: AccountType.SALARY, weight: 0.1 },
    { type: AccountType.DEMAT, weight: 0.05 },
    { type: AccountType.NRI, weight: 0.05 },
    { type: AccountType.PPF, weight: 0.05 },
    { type: AccountType.FD, weight: 0.03 },
    { type: AccountType.RD, weight: 0.02 }
  ];
  
  const rand = Math.random();
  let sum = 0;
  for (const { type, weight } of types) {
    sum += weight;
    if (rand <= sum) return type;
  }
  return AccountType.SAVINGS;
};

// Add new helper functions after existing helpers
const generateTransactionReference = (): string => {
  return `TXN${Date.now()}${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
};

const generateDescription = (mode: TransactionMode): string => {
  const descriptions = {
    [TransactionMode.UPI]: ["UPI Payment", "UPI Transfer", "UPI Collection"],
    [TransactionMode.NEFT]: ["Salary", "Rent", "Business Payment"],
    [TransactionMode.IMPS]: ["Quick Transfer", "Emergency Fund", "Family Support"],
    [TransactionMode.CASH]: ["ATM Withdrawal", "Cash Deposit", "Cash Payment"],
    [TransactionMode.CHEQUE]: ["Cheque Payment", "Rent Payment", "Invoice Payment"],
    [TransactionMode.ATM]: ["ATM Withdrawal", "Cash Withdrawal"],
    [TransactionMode.POS]: ["Shopping", "Restaurant", "Fuel"],
    [TransactionMode.INTERNET_BANKING]: ["Online Shopping", "Bill Payment", "Subscription"]
  };
  
  const options = descriptions[mode] || ["General Transaction"];
  return options[Math.floor(Math.random() * options.length)];
};

async function main() {
  try {
    // Type assertion for enum access
    const employmentTypes = Object.values(EmploymentType) as EmploymentType[];
    const investmentTypes = Object.values(InvestmentType) as InvestmentType[];
    const loanTypes = Object.values(LoanType) as LoanType[];

    // Create branches with realistic data
    const branches = await Promise.all(
      Array.from({ length: 10 }, (_, i) => {
        const state = Object.keys(cities)[i % Object.keys(cities).length];
        const city =
          cities[state][Math.floor(Math.random() * cities[state].length)];
        const code = `BR${(i + 1).toString().padStart(4, "0")}`;
        return prisma.branch.upsert({
          where: { code },
          update: {},
          create: {
            code,
            name: `${city} ${
              streets[Math.floor(Math.random() * streets.length)]
            } Branch`,
            address: `${Math.floor(Math.random() * 100) + 1}, ${
              streets[Math.floor(Math.random() * streets.length)]
            }`,
            city,
            state,
            ifscCode: `DBANK${(i + 1).toString().padStart(4, "0")}`,
          },
        });
      })
    );

    // Reduce batch size to prevent connection issues
    const BATCH_SIZE = 50;
    const TOTAL_USERS = 1000;

    // Process users sequentially in smaller batches
    for (let batch = 0; batch < TOTAL_USERS / BATCH_SIZE; batch++) {
      try {
        // Create users with realistic data
        for (let i = 0; i < BATCH_SIZE; i++) {
          const index = batch * BATCH_SIZE + i;
          const firstName =
            firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName =
            lastNames[Math.floor(Math.random() * lastNames.length)];
          const fullName = `${firstName} ${lastName}`;
          const employmentType =
            employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
          const income = generateSalary(employmentType);

          const user = await prisma.user.upsert({
            where: { pan: generatePAN(index) },
            update: {},
            create: {
              pan: generatePAN(index),
              name: fullName,
              mobile: generateMobile(),
              email: generateEmail(firstName, lastName),
              dob: new Date(
                1970 + Math.floor(Math.random() * 35), // More realistic age range
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
              ),
              employmentType,
              income,
              kycComplete: Math.random() > 0.05, // 95% KYC complete rate
            },
          });

          // Create account with realistic balances
          const randomBranch =
            branches[Math.floor(Math.random() * branches.length)];
          const accountType = generateAccountType();
          const balance = generateAccountBalance(accountType, user.income || 0);
          await prisma.bankAccount.create({
            data: {
              userId: user.id,
              accountNumber: generateAccountNumber(index),
              type: accountType,
              ifscCode: randomBranch.ifscCode,
              branchCode: randomBranch.code,
              balance,
              nomineeName: `${
                firstNames[Math.floor(Math.random() * firstNames.length)]
              } ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
              nomineeRelation: ["Spouse", "Parent", "Child", "Sibling"][
                Math.floor(Math.random() * 4)
              ],
            },
          });

          // Create investment (30% chance)
          if (Math.random() > 0.7) {
            await prisma.investment.create({
              data: {
                userId: user.id,
                type: investmentTypes[
                  Math.floor(Math.random() * investmentTypes.length)
                ],
                amount: randomAmount(10000, 500000),
                currentValue: randomAmount(10000, 600000),
                interestRate: randomAmount(5, 15),
                maturityDate: new Date(
                  2024 + Math.floor(Math.random() * 3),
                  Math.floor(Math.random() * 12),
                  1
                ),
              },
            });
          }

          // Create loan (20% chance)
          if (Math.random() > 0.8) {
            const account = await prisma.bankAccount.findFirst({
              where: { userId: user.id },
            });
            if (account) {
              await prisma.loan.create({
                data: {
                  accountId: account.id,
                  userId: user.id,
                  type: loanTypes[Math.floor(Math.random() * loanTypes.length)],
                  amount: randomAmount(100000, 5000000),
                  emi: randomAmount(5000, 50000),
                  startDate: new Date(),
                  tenureMonths: [12, 24, 36, 60, 120, 240][
                    Math.floor(Math.random() * 6)
                  ],
                  remainingAmount: randomAmount(100000, 5000000),
                  interestRate: randomAmount(7, 15),
                  purpose: ["Home", "Business", "Education", "Personal"][
                    Math.floor(Math.random() * 4)
                  ],
                },
              });
            }
          }
        }

        console.log(
          `Processed batch ${batch + 1} of ${TOTAL_USERS / BATCH_SIZE}`
        );

        // Add a small delay between batches to allow connections to close
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error in batch ${batch}:`, error);
        // Continue with next batch instead of failing completely
        continue;
      }
    }

    console.log("Creating transactions...");
    
    // Get all account IDs
    const accounts = await prisma.bankAccount.findMany({
      select: { id: true }
    });

    // Create transactions between accounts
    const transactionModes = Object.values(TransactionMode);
    
    for (let i = 0; i < accounts.length * 5; i++) { // 5 transactions per account on average
      const fromAccount = accounts[Math.floor(Math.random() * accounts.length)];
      const toAccount = accounts[Math.floor(Math.random() * accounts.length)];
      const mode = transactionModes[Math.floor(Math.random() * transactionModes.length)];
      
      if (fromAccount.id === toAccount.id) continue;

      await prisma.transaction.create({
        data: {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount: randomAmount(100, 50000),
          mode,
          description: generateDescription(mode),
          reference: generateTransactionReference(),
          status: Math.random() > 0.05 ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
        }
      });

      if (i % 1000 === 0) {
        console.log(`Created ${i} transactions`);
      }
    }

    // Create more investments
    console.log("Creating additional investments...");
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    for (const user of users) {
      if (Math.random() > 0.5) { // 50% chance of having multiple investments
        const numInvestments = Math.floor(Math.random() * 3) + 1; // 1-3 investments
        
        for (let i = 0; i < numInvestments; i++) {
          await prisma.investment.create({
            data: {
              userId: user.id,
              type: investmentTypes[Math.floor(Math.random() * investmentTypes.length)],
              amount: randomAmount(10000, 1000000),
              currentValue: randomAmount(10000, 1200000),
              interestRate: randomAmount(5, 15),
              maturityDate: new Date(
                2024 + Math.floor(Math.random() * 5),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
              ),
            }
          });
        }
      }
    }

    // Create more loans
    console.log("Creating additional loans...");
    for (const user of users) {
      if (Math.random() > 0.7) { // 30% chance of having multiple loans
        const numLoans = Math.floor(Math.random() * 2) + 1; // 1-2 loans
        
        const account = await prisma.bankAccount.findFirst({
          where: { userId: user.id }
        });

        if (account) {
          for (let i = 0; i < numLoans; i++) {
            const loanAmount = randomAmount(100000, 5000000);
            await prisma.loan.create({
              data: {
                accountId: account.id,
                userId: user.id,
                type: loanTypes[Math.floor(Math.random() * loanTypes.length)],
                amount: loanAmount,
                emi: Math.floor(loanAmount / (12 * (Math.random() * 5 + 1))), // Random EMI based on loan amount
                startDate: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1),
                tenureMonths: [12, 24, 36, 60, 120, 240][Math.floor(Math.random() * 6)],
                remainingAmount: randomAmount(1000, loanAmount),
                interestRate: randomAmount(7, 15),
                purpose: ["Home Purchase", "Business Expansion", "Education", "Vehicle", "Personal Use"][Math.floor(Math.random() * 5)],
                collateral: Math.random() > 0.5 ? ["Property", "Gold", "Shares", "Fixed Deposit"][Math.floor(Math.random() * 4)] : null
              }
            });
          }
        }
      }
    }

    console.log("Database has been seeded successfully with all tables");
  } catch (error) {
    console.error("Fatal error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
