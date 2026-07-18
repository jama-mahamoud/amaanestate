import admin from 'firebase-admin';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const saKey = process.env.FIREBASE_SERVICE_ACCOUNT;
if (saKey) {
  console.log('Initializing admin with FIREBASE_SERVICE_ACCOUNT...');
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(saKey)),
    projectId: config.projectId,
  });
} else {
  console.log('FIREBASE_SERVICE_ACCOUNT not found, trying default initialization...');
  admin.initializeApp({
    projectId: config.projectId,
  });
}

const dbId = config.firestoreDatabaseId;
const finalDbId = (dbId && dbId !== '(default)' && dbId !== 'default') ? dbId : undefined;
const db = finalDbId ? admin.firestore(admin.apps[0], finalDbId) : admin.firestore();

async function run() {
  console.log('Querying the articles collection...');
  const snapshot = await db.collection('articles').limit(5).get();
  console.log(`Found ${snapshot.size} documents in articles`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id}`);
    console.log(`  Title: "${data.title}"`);
    console.log(`  Slug: "${data.slug}"`);
    console.log(`  Category:`, data.category);
    console.log(`  Status: "${data.status}"`);
    console.log(`  Featured Image:`, data.featuredImage);
    console.log(`  Summary: "${data.summary}"`);
    console.log(`  Tags:`, data.tags);
  });
}

run().catch(console.error);
