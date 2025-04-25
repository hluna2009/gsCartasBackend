const fs = require('fs-extra');
const path = require('path');

async function copyPrisma() {
  const dest = './dist/node_modules/@prisma';
  
  try {
    // Crear estructura de directorios
    await fs.ensureDir(dest);
    
    // Copiar solo el cliente Prisma
    await fs.copy(
      './node_modules/@prisma/client', 
      path.join(dest, 'client')
    );
    
    // Copiar el runtime de Prisma
    await fs.copy(
      './node_modules/.prisma', 
      './dist/node_modules/.prisma'
    );
    
    console.log('Prisma files copied successfully!');
  } catch (err) {
    console.error('Error copying Prisma files:', err);
    process.exit(1);
  }
}

copyPrisma();