const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const diseases = [
  'Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 'Heart Disease',
  'Thyroid', 'Kidney Disease', 'Liver Disease', 'Migraine', 'Depression',
  'Anxiety', 'Skin Disorders', 'Eye Disease', 'Ear Infection', 'Bone Fracture',
  'Fever', 'Cold & Flu', 'Stomach Pain', 'Back Pain', 'Cancer'
]

async function main() {
  console.log('🌱 Seeding Doctor Hub database...')

  const hash = (pw) => bcrypt.hash(pw, 12)

  // Super Admin
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@doctorhub.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@doctorhub.com',
      password: await hash('SuperAdmin@123'),
      role: 'SUPER_ADMIN',
      phone: '+1-000-000-0001'
    }
  })

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@doctorhub.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@doctorhub.com',
      password: await hash('Admin@123'),
      role: 'ADMIN',
      phone: '+1-000-000-0002'
    }
  })

  // Doctors
  const doctorData = [
    {
      name: 'Dr. Sarah Johnson', email: 'sarah@doctorhub.com', phone: '+1-555-100-1001',
      specialization: 'Cardiology', treatmentType: 'ALLOPATHIC', licenseNumber: 'AL-2024-001',
      experience: 12, consultationFee: 150, rating: 4.8, totalReviews: 245,
      diseases: JSON.stringify(['Heart Disease', 'Hypertension', 'Chest Pain', 'Diabetes']),
      bio: 'Board-certified cardiologist with 12 years of experience in treating cardiovascular diseases.'
    },
    {
      name: 'Dr. Ahmed Khan', email: 'ahmed@doctorhub.com', phone: '+1-555-100-1002',
      specialization: 'General Medicine', treatmentType: 'ALLOPATHIC', licenseNumber: 'AL-2024-002',
      experience: 8, consultationFee: 80, rating: 4.6, totalReviews: 189,
      diseases: JSON.stringify(['Fever', 'Cold & Flu', 'Diabetes', 'Hypertension', 'Stomach Pain']),
      bio: 'General practitioner focused on preventive care and chronic disease management.'
    },
    {
      name: 'Dr. Priya Sharma', email: 'priya@doctorhub.com', phone: '+1-555-100-1003',
      specialization: 'Homeopathic Medicine', treatmentType: 'HOMEOPATHIC', licenseNumber: 'HM-2024-003',
      experience: 15, consultationFee: 60, rating: 4.9, totalReviews: 312,
      diseases: JSON.stringify(['Asthma', 'Skin Disorders', 'Anxiety', 'Depression', 'Migraine']),
      bio: 'Experienced homeopathic practitioner specializing in chronic conditions and mental wellness.'
    },
    {
      name: 'Dr. Hassan Ali', email: 'hassan@doctorhub.com', phone: '+1-555-100-1004',
      specialization: 'Herbal & Unani Medicine', treatmentType: 'HERBAL', licenseNumber: 'HB-2024-004',
      experience: 20, consultationFee: 50, rating: 4.7, totalReviews: 401,
      diseases: JSON.stringify(['Arthritis', 'Back Pain', 'Liver Disease', 'Kidney Disease', 'Diabetes']),
      bio: 'Traditional herbal medicine expert with 20+ years treating complex chronic conditions naturally.'
    },
    {
      name: 'Dr. Emily Chen', email: 'emily@doctorhub.com', phone: '+1-555-100-1005',
      specialization: 'Neurology', treatmentType: 'ALLOPATHIC', licenseNumber: 'AL-2024-005',
      experience: 10, consultationFee: 200, rating: 4.9, totalReviews: 178,
      diseases: JSON.stringify(['Migraine', 'Depression', 'Anxiety', 'Epilepsy', 'Back Pain']),
      bio: 'Neurologist specializing in headache disorders, epilepsy, and neuropsychiatric conditions.'
    },
    {
      name: 'Dr. Fatima Malik', email: 'fatima@doctorhub.com', phone: '+1-555-100-1006',
      specialization: 'Homeopathic Pediatrics', treatmentType: 'HOMEOPATHIC', licenseNumber: 'HM-2024-006',
      experience: 7, consultationFee: 45, rating: 4.5, totalReviews: 134,
      diseases: JSON.stringify(['Fever', 'Cold & Flu', 'Asthma', 'Skin Disorders', 'Ear Infection']),
      bio: 'Pediatric homeopathic specialist helping children with natural, gentle treatments.'
    },
  ]

  const createdDoctors = []
  for (const doc of doctorData) {
    const { name, email, phone, specialization, treatmentType, licenseNumber, experience, consultationFee, rating, totalReviews, diseases: dis, bio } = doc
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, password: await hash('Doctor@123'), role: 'DOCTOR', phone }
    })
    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id, specialization, treatmentType, licenseNumber,
        experience, consultationFee, rating, totalReviews, diseases: dis, bio,
        isVerified: true
      }
    })
    createdDoctors.push(doctor)
    
    // Add clinic for each doctor
    const existingClinic = await prisma.clinic.findFirst({ where: { doctorId: doctor.id } })
    if (!existingClinic) {
      const clinic = await prisma.clinic.create({
        data: {
          doctorId: doctor.id,
          name: `${name.replace('Dr. ', '')} Medical Center`,
          address: `${Math.floor(Math.random()*999)+1} Healthcare Ave, Medical City`,
          phone: phone,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random()*5)],
        }
      })
      // Add schedules
      const days = [1, 2, 3, 4, 6] // Mon-Fri + Sat
      for (const day of days) {
        await prisma.schedule.create({
          data: {
            clinicId: clinic.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            maxSlots: 15,
          }
        })
      }
    }
  }

  // Patients
  const patientData = [
    { name: 'John Smith', email: 'john@patient.com', phone: '+1-555-200-2001', bloodGroup: 'A+' },
    { name: 'Maria Garcia', email: 'maria@patient.com', phone: '+1-555-200-2002', bloodGroup: 'O-' },
    { name: 'James Wilson', email: 'james@patient.com', phone: '+1-555-200-2003', bloodGroup: 'B+' },
  ]

  const createdPatients = []
  for (const pat of patientData) {
    const user = await prisma.user.upsert({
      where: { email: pat.email },
      update: {},
      create: { name: pat.name, email: pat.email, password: await hash('Patient@123'), role: 'PATIENT', phone: pat.phone }
    })
    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, bloodGroup: pat.bloodGroup, address: '123 Main St, City' }
    })
    createdPatients.push(patient)
  }

  // Assistant
  const assistantUser = await prisma.user.upsert({
    where: { email: 'assistant@doctorhub.com' },
    update: {},
    create: {
      name: 'Jane Assistant',
      email: 'assistant@doctorhub.com',
      password: await hash('Assistant@123'),
      role: 'ASSISTANT',
      phone: '+1-555-300-3001'
    }
  })
  await prisma.assistant.upsert({
    where: { userId: assistantUser.id },
    update: {},
    create: { userId: assistantUser.id, doctorId: createdDoctors[0].id }
  })

  // Sample appointments
  if (createdPatients.length > 0 && createdDoctors.length > 0) {
    const existingAppt = await prisma.appointment.findFirst()
    if (!existingAppt) {
      await prisma.appointment.create({
        data: {
          patientId: createdPatients[0].id,
          doctorId: createdDoctors[0].id,
          date: '2026-06-20',
          time: '10:00 AM',
          reason: 'Regular checkup for hypertension',
          status: 'CONFIRMED'
        }
      })
      
      // Medical history
      await prisma.medicalHistory.create({
        data: {
          patientId: createdPatients[0].id,
          title: 'Diagnosed with Hypertension',
          description: 'Patient was diagnosed with stage 1 hypertension. Blood pressure readings consistently above 140/90.',
          diagnosis: 'Stage 1 Hypertension',
          addedBy: createdDoctors[0].userId
        }
      })
    }
  }

  console.log('✅ Seeding completed!')
  console.log('\n📋 Default Credentials:')
  console.log('Super Admin: superadmin@doctorhub.com / SuperAdmin@123')
  console.log('Admin:       admin@doctorhub.com / Admin@123')
  console.log('Doctor:      sarah@doctorhub.com / Doctor@123')
  console.log('Patient:     john@patient.com / Patient@123')
  console.log('Assistant:   assistant@doctorhub.com / Assistant@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
