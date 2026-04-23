import bcrypt from 'bcryptjs';

const users = [
    // --- ADMIN ---
    { "_id": "65f1a001a1a1a1a1a1a1a1a1", "name": "Admin StageFlow", "email": "admin@stageflow.tn", "role": "admin", "phone": "71000000", "university": "StageFlow HQ", "specialty": "Administration" },

    // --- ENCADRANTS ---
    { "_id": "65f1b001b1b1b1b1b1b1b1b1", "name": "Dr. Karim Mansouri", "email": "karim.mansouri@esprit.tn", "role": "encadrant", "phone": "71234501", "university": "ESPRIT", "specialty": "Génie Logiciel" },
    { "_id": "65f1b002b1b1b1b1b1b1b1b1", "name": "Dr. Sonia Belhadj", "email": "sonia.belhadj@enit.tn", "role": "encadrant", "phone": "71234502", "university": "ENIT", "specialty": "Intelligence Artificielle" },
    { "_id": "65f1b003b1b1b1b1b1b1b1b1", "name": "Prof. Mehdi Trabelsi", "email": "mehdi.trabelsi@fst.tn", "role": "encadrant", "phone": "71234503", "university": "FST", "specialty": "Data Science" },

    // --- ENTREPRISES ---
    { "_id": "65f1c001c1c1c1c1c1c1c1c1", "name": "TechNova Tunisie", "email": "contact@technova.tn", "role": "entreprise", "phone": "71100100", "specialty": "Développement Logiciel" },
    { "_id": "65f1c002c1c1c1c1c1c1c1c1", "name": "Digital Solutions", "email": "rh@digitalsolutions.tn", "role": "entreprise", "phone": "71200200", "specialty": "Conseil IT" },
    { "_id": "65f1c003c1c1c1c1c1c1c1c1", "name": "DataExperts", "email": "stage@dataexperts.tn", "role": "entreprise", "phone": "71300300", "specialty": "Data Analytics" },
    { "_id": "65f1c004c1c1c1c1c1c1c1c1", "name": "Creative Hub", "email": "jobs@creativehub.tn", "role": "entreprise", "phone": "71400400", "specialty": "Design & UX" },
    { "_id": "65f1c005c1c1c1c1c1c1c1c1", "name": "CloudSys", "email": "recrutement@cloudsys.tn", "role": "entreprise", "phone": "71500500", "specialty": "Cloud & DevOps" },

    // --- ETUDIANTS ---
    { "_id": "65f1d001d1d1d1d1d1d1d1d1", "name": "Chaima Ben Ali", "email": "chaima.benali@etudiant.esprit.tn", "role": "étudiant", "phone": "55123456", "university": "ESPRIT", "specialty": "Informatique" },
    { "_id": "65f1d002d1d1d1d1d1d1d1d2", "name": "Yassine Gharbi", "email": "yassine.gharbi@etudiant.enit.tn", "role": "étudiant", "phone": "55234567", "university": "ENIT", "specialty": "Génie Informatique" },
    { "_id": "65f1d003d1d1d1d1d1d1d1d3", "name": "Rania Hamdi", "email": "rania.hamdi@etudiant.fst.tn", "role": "étudiant", "phone": "55345678", "university": "FST", "specialty": "Data Science" },
    { "_id": "65f1d004d1d1d1d1d1d1d1d4", "name": "Amine Khelifi", "email": "amine.khelifi@etudiant.isim.tn", "role": "étudiant", "phone": "55456789", "university": "ISIM", "specialty": "Réseaux & Télécoms" },
    { "_id": "65f1d005d1d1d1d1d1d1d1d5", "name": "Nour El Houda Sassi", "email": "nour.sassi@etudiant.iset.tn", "role": "étudiant", "phone": "55567890", "university": "ISET", "specialty": "Développement Web" },
    { "_id": "65f1d006d1d1d1d1d1d1d1d6", "name": "Aziz Mbarki", "email": "aziz.mbarki@etudiant.esprit.tn", "role": "étudiant", "phone": "55678901", "university": "ESPRIT", "specialty": "Cybersécurité" }
];

async function generateSeedingData() {
    const plainPassword = "password123"; 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const finalData = users.map(u => ({
        ...u,
        _id: { "$oid": u._id }, // Format JSON MongoDB
        password: hashedPassword,
        supervisorId: null,
        supervisorName: "",
        isActive: true,
        createdAt: { "$date": new Date().toISOString() },
        updatedAt: { "$date": new Date().toISOString() },
        __v: 0
    }));

    console.log(JSON.stringify(finalData, null, 2));
}

generateSeedingData();