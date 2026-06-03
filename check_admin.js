import admin from 'firebase-admin';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

admin.initializeApp({
  projectId: config.projectId,
});

const db = admin.firestore();

async function run() {
  console.log('Querying the listings collection via firebase-admin...');
  const snapshot = await db.collection('listings').limit(5).get();
  console.log(`Found ${snapshot.size} documents in listings`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id}, Title: "${data.title}", City: "${data.city}", Category: "${data.category}", Status: "${data.status}"`);
  });
}

run().catch(console.error);
