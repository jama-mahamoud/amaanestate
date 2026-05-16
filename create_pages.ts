import fs from 'fs';
import path from 'path';

const pages = [
  'src/pages/Home.tsx',
  'src/pages/Properties.tsx',
  'src/pages/Vehicles.tsx',
  'src/pages/PropertyDetails.tsx',
  'src/pages/VehicleDetails.tsx',
  'src/pages/About.tsx',
  'src/pages/Contact.tsx',
  'src/pages/News.tsx',
  'src/pages/ArticleDetails.tsx',
  'src/pages/Login.tsx',
  'src/pages/Register.tsx',
  'src/pages/dashboard/DashboardLayout.tsx',
  'src/pages/dashboard/DashboardHome.tsx',
  'src/pages/dashboard/DashboardProperties.tsx',
  'src/pages/dashboard/DashboardVehicles.tsx',
  'src/pages/dashboard/DashboardUsers.tsx',
  'src/pages/dashboard/DashboardSettings.tsx',
  'src/pages/dashboard/DashboardArticles.tsx',
];

for(const p of pages) {
  const fullPath = path.resolve(p);
  const dir = path.dirname(fullPath);
  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
  const name = path.basename(p, '.tsx');
  fs.writeFileSync(fullPath, `export default function ${name}() { return <div>${name}</div>; }`);
}
