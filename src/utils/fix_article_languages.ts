async function main() {
  const projectId = "amaanestate-97f4f";
  const databaseId = "(default)";
  const collectionName = "articles";
  const apiKey = "AIzaSyBInp5M8dVTctLoLw9I44_mPzOx-Q7JhoE";

  const articlesToUpdate = [
    { id: "99IuUGjA7Ou5OAiw4zyO", lang: "so", title: "Ha iibsan dhul kahor intaadan hubin 5-tan arrimood" },
    { id: "CP9L2lQBwrG3CGPYvssP", lang: "so", title: "Horumarka Suuqa Guryaha Jijiga iyo Doorka AmaanEstate uu kuleeyahay" },
    { id: "Cjc5bMXjwU1CfoVDeduL", lang: "so", title: "Fursadaha Maalgashiga Jigjiga 2026: Guryaha, Dhulka iyo Ganacsiga" },
    { id: "NTEDvZ7ijVvJcp2qHOVF", lang: "so", title: "10 Qodob oo Aad Hubin Karto Kahor Intaadan Guri Kiraysan" },
    { id: "UBsouDeqo9BczFFe1aXN", lang: "so", title: "AmaanEstate Soomaaliya: Platform-ka Casriga ah ee Kiraynta iyo Iibinta Guryaha" },
    { id: "VQyXROXAco4EImmJRlFf", lang: "en", title: "Amaan Estate Somalia Real Estate System" },
    { id: "VR4mjmPcxQNvCkwChqhl", lang: "so", title: "AmaanEstate: Halbeegga Cusub ee Maamulka Hantida Casriga ah ee Soomaaliya" },
    { id: "cRbV9MHGj4zq98nv8EyN", lang: "so", title: "5 Fursadood oo Maalgashi oo Hadda Ka Jira Magaalada Dire Dawa" },
    { id: "nO4slXjTUXj1myEL8idA", lang: "so", title: "Sida AmaanEstate U Joojinayo Double Sell iyo Khayaanada Dhulka" },
    { id: "oQqHE42apHWK97bkS1FD", lang: "so", title: "7 Tallaabo Oo Lagu Hubin Karo Sharciyadda Kahor Dhul Iibsiga" }
  ];

  console.log("--- STARTING ARTICLE LANGUAGE MIGRATION WITH API KEY ---");

  for (const item of articlesToUpdate) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${item.id}?updateMask.fieldPaths=language&key=${apiKey}`;
    
    const payload = {
      fields: {
        language: {
          stringValue: item.lang
        }
      }
    };

    console.log(`Updating document ${item.id} (${item.title}) -> language: "${item.lang}"...`);
    
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`❌ Failed to update ${item.id}. Status: ${response.status}, error:`, text);
      } else {
        console.log(`✅ Successfully updated ${item.id}`);
      }
    } catch (error) {
      console.error(`❌ Error networking for ${item.id}:`, error);
    }
  }

  console.log("--- MIGRATION COMPLETED ---");
}

main();
