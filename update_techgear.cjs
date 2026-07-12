const fs = require('fs');
let code = fs.readFileSync('src/pages/TechGearPage.tsx', 'utf-8');

const startIndex = code.indexOf('<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">');
const endIndex = code.indexOf('          </div>\n        ) : (\n          <div className="text-center');

if (startIndex !== -1 && endIndex !== -1) {
  const newBlock = `<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            {filteredHardware.map((product) => {
              const unifiedProduct = {
                id: product.id,
                sourceId: product.id,
                type: 'tech-gear' as const,
                brandName: product.brandName,
                title: product.title,
                description: product.description || '',
                featuredImage: product.featuredImage,
                galleryImages: product.galleryImages || [product.featuredImage],
                price: \`$\${product.price}\`,
                affiliateUrl: product.affiliateUrl,
                category: product.category,
                slug: product.slug
              };
              return (
                <div key={product.id} className="relative">
                   <ProductCard p={unifiedProduct} />
                   {/* Compare Toggle Button overlay */}
                   <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(product.id);
                      }}
                      className={\`absolute top-2 right-2 z-10 px-2 py-1 rounded text-[10px] font-bold font-mono uppercase border transition-all \${
                        compareIds.includes(product.id)
                          ? 'bg-[#C5A059] border-[#C5A059] text-white font-semibold'
                          : 'bg-white/90 border-slate-200 text-slate-500 hover:text-slate-900'
                      }\`}
                    >
                      {compareIds.includes(product.id) ? '✓' : '+'}
                    </button>
                </div>
              );
            })}
`;

  code = code.substring(0, startIndex) + newBlock + code.substring(endIndex);
  fs.writeFileSync('src/pages/TechGearPage.tsx', code);
  console.log('Successfully updated TechGearPage.tsx');
} else {
  console.error('Could not find start/end bounds.');
}
