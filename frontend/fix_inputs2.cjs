const fs = require('fs');

const file1 = 'src/components/layout/TopBar.jsx';
let code1 = fs.readFileSync(file1, 'utf8');
code1 = code1.replace(
  'className="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 shadow-none text-sm placeholder:text-ink-faint"',
  'className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:border-none focus:ring-0 shadow-none appearance-none text-sm placeholder:text-ink-faint"'
);
fs.writeFileSync(file1, code1);

const file2 = 'src/pages/ListaPage.jsx';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(
  'className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none text-[15px] placeholder:text-ink-soft/70"',
  'className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:border-none focus:ring-0 shadow-none appearance-none text-[15px] placeholder:text-ink-soft/70"'
);
fs.writeFileSync(file2, code2);

console.log('Inputs fully fixed');
