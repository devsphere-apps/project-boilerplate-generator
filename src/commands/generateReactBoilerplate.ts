import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as childProcess from 'child_process';

export const generateReactBoilerplate = async () => {
  const frameworkChoice = await vscode.window.showQuickPick(['React', 'Next.js'], {
    placeHolder: 'Choose Framework',
  });

  const languageChoice = await vscode.window.showQuickPick(['JavaScript', 'TypeScript'], {
    placeHolder: 'Choose Language',
  });

  const stateManagementChoice = await vscode.window.showQuickPick(['None', 'Redux', 'Zustand'], {
    placeHolder: 'Choose State Management',
  });

  const authChoice = await vscode.window.showQuickPick(['None', 'JWT', 'OAuth'], {
    placeHolder: 'Choose Authentication Method',
  });

  const stylingChoice = await vscode.window.showQuickPick(
    ['CSS Modules', 'TailwindCSS', 'Styled-components', 'Sass', 'Less'],
    {
      placeHolder: 'Choose Styling Solution',
    }
  );

  const rootDir = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!rootDir) {
    vscode.window.showErrorMessage('No workspace folder found');
    return;
  }

  const createDirs = (dirs: string[]) => {
    dirs.forEach((dir: string) => {
      const fullPath = path.join(rootDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  };

  const directories = ['src', 'src/components', 'public', 'src/styles'];

  if (frameworkChoice === 'Next.js') {
    directories.push('pages', 'pages/api');
  }

  createDirs(directories);

  const packageJsonContent = `
{
  "name": "${frameworkChoice?.toLowerCase()}-boilerplate",
  "version": "1.0.0",
  "description": "A ${frameworkChoice} boilerplate with ${stateManagementChoice} and ${authChoice}",
  "license": "MIT",
  "scripts": {
    "dev": "${frameworkChoice === 'Next.js' ? 'next dev' : 'react-scripts start'}",
    "build": "${frameworkChoice === 'Next.js' ? 'next build' : 'react-scripts build'}",
    "start": "${frameworkChoice === 'Next.js' ? 'next start' : 'react-scripts start'}",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "${frameworkChoice === 'Next.js' ? 'next' : 'react-scripts'}": "latest",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    ${stateManagementChoice === 'Redux' ? '"@reduxjs/toolkit": "^1.9.5",' : ''}
    ${stateManagementChoice === 'Zustand' ? '"zustand": "^4.3.8",' : ''}
    ${authChoice === 'JWT' ? '"jsonwebtoken": "^9.0.0",' : ''}
    ${authChoice === 'OAuth' ? '"next-auth": "^4.22.1",' : ''}
    ${stylingChoice === 'TailwindCSS' ? '"tailwindcss": "^3.3.2",' : ''}
    ${stylingChoice === 'Styled-components' ? '"styled-components": "^5.3.10",' : ''}
    ${stylingChoice === 'Sass' ? '"sass": "^1.62.1",' : ''}
    ${stylingChoice === 'Less' ? '"less": "^4.1.3",' : ''}
    "axios": "^1.4.0"
  },
  "devDependencies": {
    ${languageChoice === 'TypeScript' ? '"typescript": "^5.0.4",' : ''}
    "eslint": "^8.40.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-react": "^7.32.2",
    ${languageChoice === 'TypeScript' ? '"@typescript-eslint/eslint-plugin": "^5.59.6",' : ''}
    ${languageChoice === 'TypeScript' ? '"@typescript-eslint/parser": "^5.59.6",' : ''}
    ${languageChoice === 'JavaScript' ? '"@babel/eslint-parser": "^7.21.8",' : ''}
    "prettier": "^2.8.8",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  },
  ${frameworkChoice === 'React' ? `
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }` : ''}
}
`;
  fs.writeFileSync(path.join(rootDir, 'package.json'), packageJsonContent);

  const gitignoreContent = `
# dependencies
/node_modules

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
  fs.writeFileSync(path.join(rootDir, '.gitignore'), gitignoreContent);

  const readmeContent = `
# ${frameworkChoice} Boilerplate

This project was bootstrapped with a custom ${frameworkChoice} boilerplate.

## Available Scripts

In the project directory, you can run:

### \`npm run dev\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### \`npm run build\`

Builds the app for production to the \`build\` folder.

### \`npm start\`

Runs the app in production mode.

### \`npm run lint\`

Lints the project files using ESLint.

### \`npm run format\`

Formats the project files using Prettier.
`;
  fs.writeFileSync(path.join(rootDir, 'README.md'), readmeContent);

  const envContent = `
REACT_APP_API_URL=http://localhost:3000/api
`;
  fs.writeFileSync(path.join(rootDir, '.env'), envContent);

  const eslintContent = `
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    ${languageChoice === 'TypeScript' ? "'plugin:@typescript-eslint/recommended'," : ''}
    'prettier'
  ],
  parser: ${languageChoice === 'TypeScript' ? "'@typescript-eslint/parser'" : "'@babel/eslint-parser'"},
  plugins: ['react'${languageChoice === 'TypeScript' ? ", '@typescript-eslint'" : ''}],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    // Add custom rules here
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
`;
  fs.writeFileSync(path.join(rootDir, '.eslintrc.js'), eslintContent);

  const prettierContent = `
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
`;
  fs.writeFileSync(path.join(rootDir, '.prettierrc'), prettierContent);

  const componentTemplate = `
import React from 'react';

interface Props {
  // Define props here
}

const Component: React.FC<Props> = () => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default Component;
`;
  fs.writeFileSync(path.join(rootDir, 'src', 'components', 'ComponentTemplate.tsx'), componentTemplate);

  if (frameworkChoice === 'React') {
    const indexCssContent = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'index.css'), indexCssContent);

    const indexTsxContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'index.tsx'), indexTsxContent);

    const appTsxContent = `
import React from 'react';
import Header from './components/Header';

function App() {
  return (
    <div className="App">
      <Header />
      <h1>Welcome to React with TypeScript</h1>
    </div>
  );
}

export default App;
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'App.tsx'), appTsxContent);

    const indexHtmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;
    fs.writeFileSync(path.join(rootDir, 'public', 'index.html'), indexHtmlContent);
  }

  if (frameworkChoice === 'Next.js') {
    const indexTsxContent = `
import React from 'react';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Next.js with TypeScript</h1>
    </div>
  );
}
`;
    fs.writeFileSync(path.join(rootDir, 'pages', 'index.tsx'), indexTsxContent);

    const appTsxContent = `
import '../styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
    fs.writeFileSync(path.join(rootDir, 'pages', '_app.tsx'), appTsxContent);

    const documentTsxContent = `
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
`;
    fs.writeFileSync(path.join(rootDir, 'pages', '_document.tsx'), documentTsxContent);

    const apiHelloTsContent = `
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'John Doe' });
}
`;
    fs.writeFileSync(path.join(rootDir, 'pages', 'api', 'hello.ts'), apiHelloTsContent);
  }

  const headerComponentContent = `
import React from 'react';

const Header: React.FC = () => {
  return (
    <header>
      <h1>My ${frameworkChoice} App</h1>
    </header>
  );
};

export default Header;
`;
  fs.writeFileSync(path.join(rootDir, 'src', 'components', 'Header.tsx'), headerComponentContent);

  const tsconfigContent = `
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`;
  fs.writeFileSync(path.join(rootDir, 'tsconfig.json'), tsconfigContent);

  const installDependencies = async () => {
    return new Promise<void>((resolve, reject) => {
      const npmInstall = childProcess.exec('npm install', { cwd: rootDir });

      npmInstall.stdout?.on('data', (data) => {
        console.log(data.toString());
      });

      npmInstall.stderr?.on('data', (data) => {
        console.error(data.toString());
      });

      npmInstall.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  };

  try {
    await installDependencies();
    vscode.window.showInformationMessage(`${frameworkChoice} boilerplate generated and dependencies installed successfully!`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to install dependencies: ${errorMessage}`);
  }
};
