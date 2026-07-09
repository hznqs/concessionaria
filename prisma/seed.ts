import { PrismaClient, type FeatureCategory } from "@prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { hash } from "bcryptjs";
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed não pode ser executado em produção (apaga dados existentes).");
  }
  console.log("Seeding AutoPrime database...");

  // ─── Admin user ────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@autoprime.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD deve ser definida nas variáveis de ambiente antes de rodar o seed.");
  }

  const passwordHash = await hash(adminPassword, 12);
  await prisma.user.upsert({
    where:  { email: adminEmail },
    update: { password: passwordHash },
    create: {
      name:     "Administrador AutoPrime",
      email:    adminEmail,
      password: passwordHash,
      role:     "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user created:", adminEmail);

  // ─── Brands & Models ───────────────────────────────────────────────────────
  // Wipe existing vehicles and brands for the popular transition
  await prisma.vehicle.deleteMany();
  await prisma.carModel.deleteMany();
  await prisma.brand.deleteMany();
  console.log("🗑️ Cleaned up old vehicles and brands");

  const brandsData = [
    {
      name: "Fiat",
      slug: "fiat",
      models: ["Argo", "Mobi", "Cronos", "Strada", "Toro", "Pulse", "Fastback", "Uno", "Palio"],
    },
    {
      name: "Volkswagen",
      slug: "volkswagen",
      models: ["Gol", "Polo", "Virtus", "Nivus", "T-Cross", "Saveiro", "Fox", "Voyage"],
    },
    {
      name: "Chevrolet",
      slug: "chevrolet",
      models: ["Onix", "Onix Plus", "Tracker", "Montana", "Spin", "Cruze", "S10"],
    },
    {
      name: "Hyundai",
      slug: "hyundai",
      models: ["HB20", "HB20S", "Creta", "Tucson"],
    },
    {
      name: "Toyota",
      slug: "toyota",
      models: ["Corolla", "Corolla Cross", "Yaris", "Hilux", "Etios"],
    },
    {
      name: "Honda",
      slug: "honda",
      models: ["Civic", "HR-V", "Fit", "City"],
    },
    {
      name: "Renault",
      slug: "renault",
      models: ["Kwid", "Sandero", "Logan", "Duster", "Captur", "Oroch"],
    },
    {
      name: "Jeep",
      slug: "jeep",
      models: ["Compass", "Renegade"],
    },
    {
      name: "Ford",
      slug: "ford",
      models: ["Ka", "EcoSport", "Ranger", "Fiesta"],
    }
  ];

  for (const b of brandsData) {
    const brand = await prisma.brand.create({
      data: { name: b.name, slug: b.slug },
    });

    for (const m of b.models) {
      const slug = m.toLowerCase().replace(/\s+/g, "-");
      await prisma.carModel.create({
        data: { name: m, slug, brandId: brand.id },
      });
    }
  }
  console.log("✅ Brands and models seeded");

  // ─── Features (Opcionais) ──────────────────────────────────────────────────
  const featuresData: { name: string; slug: string; category: FeatureCategory; icon: string }[] = [
    // Conforto
    { name: "Ar-condicionado Digital Bizona",   slug: "ar-bizona",       category: "COMFORT",     icon: "❄️"  },
    { name: "Banco de Couro",                   slug: "banco-couro",     category: "COMFORT",     icon: "🪑"  },
    { name: "Banco com Ventilação",             slug: "banco-ventilado", category: "COMFORT",     icon: "💨"  },
    { name: "Teto Solar Elétrico",              slug: "teto-solar",      category: "COMFORT",     icon: "☀️"  },
    { name: "Teto Panorâmico",                  slug: "teto-panoramico", category: "COMFORT",     icon: "🌤️"  },
    // Segurança
    { name: "Freio ABS",                        slug: "abs",             category: "SAFETY",      icon: "🛡️"  },
    { name: "Controle de Estabilidade (ESP)",   slug: "esp",             category: "SAFETY",      icon: "⚖️"  },
    { name: "7 Airbags",                        slug: "airbags",         category: "SAFETY",      icon: "💥"  },
    { name: "Câmera de Ré 360°",               slug: "camera-360",      category: "SAFETY",      icon: "📷"  },
    { name: "Sensor de Estacionamento",        slug: "sensor-park",     category: "SAFETY",      icon: "📡"  },
    // Tecnologia
    { name: "Central Multimídia 10\"",          slug: "multimidia",      category: "TECHNOLOGY",  icon: "📱"  },
    { name: "Apple CarPlay / Android Auto",     slug: "carplay",         category: "TECHNOLOGY",  icon: "🍎"  },
    { name: "Carregador Wireless",              slug: "wireless",        category: "TECHNOLOGY",  icon: "🔋"  },
    { name: "Head-up Display",                  slug: "hud",             category: "TECHNOLOGY",  icon: "💡"  },
    { name: "Piloto Automático Adaptativo",     slug: "cruise-adaptativo", category: "TECHNOLOGY", icon: "🚗" },
    // Conveniência
    { name: "Keyless Entry e Start",            slug: "keyless",         category: "CONVENIENCE", icon: "🔑"  },
    { name: "Partida Remota",                   slug: "partida-remota",  category: "CONVENIENCE", icon: "📡"  },
    { name: "Porta-malas Automático",           slug: "porta-malas-auto", category: "CONVENIENCE", icon: "🚗" },
  ];

  for (const f of featuresData) {
    await prisma.feature.upsert({
      where:  { slug: f.slug },
      update: {},
      create: { name: f.name, slug: f.slug, category: f.category, icon: f.icon },
    });
  }
  console.log("✅ Features seeded");

  // ─── Stores (Unidades) ──────────────────────────────────────────────────────
  const storesData = [
    {
      name: "São Paulo - Flagship",
      slug: "sao-paulo-flagship",
      address: "Av. Europa, 1000 - Jardim Paulista",
      city: "São Paulo - SP",
      phone: "(11) 99999-0000",
      email: "europa@autoprime.com.br",
      hours: "Seg-Sex: 08h às 18h | Sáb: 09h às 14h",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop",
      order: 0,
    },
    {
      name: "Campinas - Select",
      slug: "campinas-select",
      address: "Rua Coronel Quirino, 2000 - Cambuí",
      city: "Campinas - SP",
      phone: "(19) 99999-1111",
      email: "campinas@autoprime.com.br",
      hours: "Seg-Sex: 08h às 18h | Sáb: 09h às 14h",
      image: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=800&auto=format&fit=crop",
      order: 1,
    },
    {
      name: "Alphaville - Boutique",
      slug: "alphaville-boutique",
      address: "Al. Rio Negro, 500",
      city: "Barueri - SP",
      phone: "(11) 99999-2222",
      email: "alphaville@autoprime.com.br",
      hours: "Seg-Sex: 08h às 18h | Sáb: Fechado",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=800&auto=format&fit=crop",
      order: 2,
    },
  ];

  for (const s of storesData) {
    await prisma.store.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }
  console.log("✅ Stores (unidades) seeded");

  console.log("\nSeed completo! Acesse: http://localhost:3000");
  console.log("   Admin: " + adminEmail);
}

main()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
