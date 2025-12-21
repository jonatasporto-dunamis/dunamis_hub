import prisma from './prismaClient'
import bcrypt from 'bcryptjs'

async function main() {
  const password = await bcrypt.hash('admin123', 10)

  // create admin user if not exists
  const existingUser = await prisma.user.findUnique({ where: { email: 'admin@dunamis.local' } })
  if (!existingUser) {
    await prisma.user.create({ data: { name: 'Admin', email: 'admin@dunamis.local', password, role: 'ADMIN' } })
  }

  // create client if not exists
  let client = await prisma.clientCompany.findFirst({ where: { name: 'Cliente Exemplo' } })
  if (!client) {
    client = await prisma.clientCompany.create({ data: { name: 'Cliente Exemplo', legalName: 'Cliente Exemplo LTDA', document: '00.000.000/0001-00' } })
  }

  const adAccount = await prisma.adAccount.create({ data: { clientId: client.id, platform: 'META', externalAccountId: 'act_123', name: 'Meta - Exemplo' } })

  // sample performance (create individually)
  const samples = [
    { adAccountId: adAccount.id, campaignName: 'Campanha A', date: new Date('2025-12-01'), impressions: 10000, clicks: 200, spend: 150.5, leads: 10, cpl: 15.05, ctr: 2.0 },
    { adAccountId: adAccount.id, campaignName: 'Campanha A', date: new Date('2025-12-02'), impressions: 12000, clicks: 240, spend: 180.0, leads: 12, cpl: 15.0, ctr: 2.0 }
  ]

  for (const s of samples) {
    await prisma.campaignPerformance.create({ data: s })
  }

  console.log('Seed finished (clean)')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
