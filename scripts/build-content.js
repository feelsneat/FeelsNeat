const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Ensure output dir exists
const outputDir = path.join(__dirname, '../src/lib');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const contentDir = path.join(__dirname, '../content');

function parseMarkdownFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const htmlContent = marked.parse(content);
  return {
    ...data,
    content: htmlContent
  };
}

function buildContent() {
  console.log('Building content database...');

  // 1. Load Settings
  const settingsPath = path.join(contentDir, 'settings/general.json');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

  // 2. Load Navigation
  const navPath = path.join(contentDir, 'navigation/main.json');
  const navigation = JSON.parse(fs.readFileSync(navPath, 'utf-8'));

  // 3. Load Pages
  const pages = {};
  const pagesDir = path.join(contentDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir);
    pageFiles.forEach(file => {
      if (file.endsWith('.md')) {
        const slug = path.basename(file, '.md');
        pages[slug] = parseMarkdownFile(path.join(pagesDir, file));
      }
    });
  }

  // 4. Load Services
  const services = [];
  const servicesDir = path.join(contentDir, 'services');
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir);
    serviceFiles.forEach(file => {
      if (file.endsWith('.md')) {
        const slug = path.basename(file, '.md');
        const parsed = parseMarkdownFile(path.join(servicesDir, file));
        services.push({ slug, ...parsed });
      }
    });
  }
  // Sort by order
  services.sort((a, b) => (a.order || 0) - (b.order || 0));

  // 5. Load Work
  const work = [];
  const workDir = path.join(contentDir, 'work');
  if (fs.existsSync(workDir)) {
    const workFiles = fs.readdirSync(workDir);
    workFiles.forEach(file => {
      if (file.endsWith('.md')) {
        const slug = path.basename(file, '.md');
        const parsed = parseMarkdownFile(path.join(workDir, file));
        work.push({ slug, ...parsed });
      }
    });
  }
  // Sort by order or date
  work.sort((a, b) => (a.order || 0) - (b.order || 0));

  // 6. Load Observations
  const observations = [];
  const observationsDir = path.join(contentDir, 'observations');
  if (fs.existsSync(observationsDir)) {
    const observationFiles = fs.readdirSync(observationsDir);
    observationFiles.forEach(file => {
      if (file.endsWith('.md')) {
        const slug = path.basename(file, '.md');
        const parsed = parseMarkdownFile(path.join(observationsDir, file));
        observations.push({ slug, ...parsed });
      }
    });
  }
  // Sort by date descending
  observations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const db = {
    settings,
    navigation,
    pages,
    services,
    work,
    observations
  };

  fs.writeFileSync(
    path.join(outputDir, 'content-db.json'),
    JSON.stringify(db, null, 2),
    'utf-8'
  );

  console.log('Content database build completed successfully!');
}

try {
  buildContent();
} catch (error) {
  console.error('Error building content database:', error);
  process.exit(1);
}
