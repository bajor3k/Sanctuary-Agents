
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, deleteDoc, doc, setDoc } from "firebase/firestore";
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

const teamsData = {
    "Advisor Services": [
        { name: "New Account Opening Guide.pdf", type: "pdf", date: "2024-01-15", url: "#" },
        { name: "Client Onboarding Checklist.docx", type: "word", date: "2023-12-10", url: "#" },
    ],
    "Principal Review Desk": [
        { name: "Trade Review Guidelines.pdf", type: "pdf", date: "2024-02-01", url: "#" },
    ],
    "Asset Movement": [
        { name: "Wire Transfer Request Form.pdf", type: "pdf", date: "2023-11-20", url: "#" },
        { name: "ACAT Transfer Procedures.docx", type: "word", date: "2023-10-05", url: "#" },
    ],
    "Compliance": [
        { name: "Annual Compliance Meeting.pptx", type: "pptx", date: "2024-01-10", url: "#" },
        { name: "Gift & Gratuity Log.xlsx", type: "excel", date: "2024-01-01", url: "#" },
    ],
    "Direct Business": [
        { name: "Direct Application Processing.pdf", type: "pdf", date: "2023-09-15", url: "#" },
    ]
};


async function seedProcedures() {
    console.log("Checking for existing procedure data...");
    const proceduresCollection = collection(db, "procedures");
    const snapshot = await getDocs(query(proceduresCollection));

    if (!snapshot.empty) {
        console.log(`Found ${snapshot.size} existing team documents. Deleting...`);
        for (const teamDoc of snapshot.docs) {
            // Also clear subcollections if any, though our structure is simple
            await deleteDoc(teamDoc.ref);
        }
        console.log("Existing data cleared.");
    }

    console.log("Seeding new procedure data...");
    for (const teamName in teamsData) {
        try {
            // Create a document for the team
            const teamDocRef = doc(db, "procedures", teamName);
            await setDoc(teamDocRef, { name: teamName });

            // Create the 'files' subcollection
            const filesCollectionRef = collection(teamDocRef, "files");
            const files = teamsData[teamName as keyof typeof teamsData];
            
            for (const fileData of files) {
                await addDoc(filesCollectionRef, fileData);
            }
            console.log(`- Created team: ${teamName} with ${files.length} file(s).`);

        } catch (error) {
            console.error(`Error adding team ${teamName}: `, error);
        }
    }

    console.log(`${Object.keys(teamsData).length} procedure teams created.`);
    console.log("Seeding complete. You can now close this process (Ctrl+C).");
}

seedProcedures().catch(console.error);
