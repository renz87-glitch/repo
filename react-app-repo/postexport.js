const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '.next'); // Cartella generata da Next.js
const sourceDir = path.join(__dirname, 'out'); // Cartella generata da Next.js
const destDir = path.join(__dirname, '..', 'wwwroot'); // Destinazione desiderata

// Se la cartella di destinazione non esiste, creala (in modo ricorsivo)
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Cartella ${destDir} creata.`);
} else {
  console.log(`La cartella ${destDir} esiste già.`);
}

/* verifico se esiste la cartella di sourceDir con il contentuto */
fs.readdir(sourceDir, (err, files) => {
    if (err) {
      console.error("Errore nella lettura della cartella:", err);
      return;
    }
    console.log("Contenuti della cartella 'out':", files);
  });

// Copia ricorsivamente i file dalla cartella di output alla destinazione
fs.cpSync(sourceDir, destDir, { recursive: true });
console.log(`Contenuti copiati da ${sourceDir} a ${destDir}.`);

// (Opzionale) Rimuovi la cartella di output se non serve più
fs.rmSync(sourceDir, { recursive: true, force: true });
console.log(`Cartella ${sourceDir} rimossa.`);

// (Opzionale) Rimuovi la cartella di .next se non serve più
fs.rmSync(sourceDir, { recursive: true, force: true });
console.log(`Cartella ${sourceDir} rimossa.`);