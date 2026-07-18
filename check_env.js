console.log("ENV Keys:");
Object.keys(process.env).forEach(key => {
  if (key.includes("API_KEY") || key.includes("FIREBASE") || key.includes("SECRET") || key.includes("GEMINI")) {
    console.log(`- ${key}: length ${process.env[key] ? process.env[key].length : 0}`);
  } else {
    // console.log(`- ${key}`);
  }
});
