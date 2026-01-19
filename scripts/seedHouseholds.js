
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, deleteDoc } from "firebase/firestore";
import "dotenv/config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (!firebaseConfig.projectId) {
    console.error("Firebase project ID is not configured. Check your .env file.");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const households = [
    {
      "advisor": {
        "name": "John Miller",
        "email": "john.miller@advisorfirm.com",
        "phone": "555-901-3344",
        "crd_personal": "1234567",
        "crd_firm": "98765",
        "address": "123 Elm St, Springfield, IL"
      },
      "client_associates": [
        {
          "name": "Susan Brown",
          "email": "susan.brown@advisorfirm.com",
          "phone": "555-123-4567"
        },
        {
          "name": "James Smith",
          "email": "james.smith@advisorfirm.com",
          "phone": "555-876-5432"
        }
      ],
      "custodians": [
        {
          "name": "Pershing",
          "g_numbers": ["G123456"],
          "ip_codes": ["IP01"],
          "masters": ["4400"]
        },
        {
          "name": "Fidelity",
          "branch": "AUS01",
          "masters": ["8844"]
        }
      ],
      "tags": [
        "advisors",
        "custodians",
        "pershing",
        "fidelity",
        "multi-custodian",
        "g#",
        "crd"
      ],
      "searchable": [
        "john",
        "miller",
        "john miller",
        "susan",
        "brown",
        "james",
        "smith",
        "advisor",
        "pershing",
        "fidelity",
        "g123456",
        "ip01",
        "4400",
        "8844",
        "crd",
        "1234567",
        "98765"
      ]
    },
    {
      "advisor": {
        "name": "Maria Rodriguez",
        "email": "maria.rodriguez@wealthco.com",
        "phone": "555-447-2299",
        "crd_personal": "7654321",
        "crd_firm": "11223",
        "address": "88 Market St, Dallas, TX"
      },
      "client_associates": [
        {
          "name": "Felipe Morales",
          "email": "felipe.morales@wealthco.com",
          "phone": "555-998-2211"
        }
      ],
      "custodians": [
        {
          "name": "Schwab",
          "masters": ["5500"],
          "ip_codes": ["IP77"]
        }
      ],
      "tags": [
        "advisors",
        "client associates",
        "schwab",
        "solo",
        "crd"
      ],
      "searchable": [
        "maria",
        "rodriguez",
        "maria rodriguez",
        "felipe",
        "morales",
        "advisor",
        "schwab",
        "5500",
        "ip77",
        "crd",
        "7654321",
        "11223"
      ]
    }
];

async function seed() {
    console.log("Checking for existing data...");
    const householdsCollection = collection(db, "households");
    const snapshot = await getDocs(query(householdsCollection));

    if (!snapshot.empty) {
        console.log(`Found ${snapshot.size} existing documents. Deleting...`);
        for (const doc of snapshot.docs) {
            await deleteDoc(doc.ref);
        }
        console.log("Existing data cleared.");
    }

    console.log("Seeding new data...");
    for (const h of households) {
        try {
            await addDoc(householdsCollection, h);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }

    console.log(`${households.length} dummy CRM households created.`);
    console.log("Seeding complete. You can now close this process (Ctrl+C).");
}

seed().catch(console.error);