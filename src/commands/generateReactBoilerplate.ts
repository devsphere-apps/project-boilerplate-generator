import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as childProcess from 'child_process';

export const generateReactBoilerplate = async () => {
  const frameworkChoice = 'React'; // For now, we're only using React

  const languageChoice = await vscode.window.showQuickPick(['JavaScript', 'TypeScript'], {
    placeHolder: 'Choose Language',
  });

  const stateManagementChoice = await vscode.window.showQuickPick(['None', 'Redux'], {
    placeHolder: 'Choose State Management',
  });

  const backendServiceChoice = await vscode.window.showQuickPick(['None', 'Firebase'], {
    placeHolder: 'Choose Backend Service',
  });

  const stylingChoice = await vscode.window.showQuickPick(['None', 'TailwindCSS'], {
    placeHolder: 'Choose Styling Solution',
  });

  const createBoilerplate = await vscode.window.showQuickPick(['Yes', 'No'], {
    placeHolder: 'Create boilerplate now?',
  });

  if (createBoilerplate !== 'Yes') {
    vscode.window.showInformationMessage('Boilerplate creation cancelled.');
    return;
  }

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

  createDirs(directories);

  const packageJsonContent = `
{
  "name": "${frameworkChoice?.toLowerCase()}-boilerplate",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    ${stateManagementChoice === 'Redux' ? `
    "@reduxjs/toolkit": "^1.9.5",
    "react-redux": "^8.1.1",` : ''}
    ${stateManagementChoice === 'MobX' ? `
    "mobx": "^6.9.0",
    "mobx-react-lite": "^3.4.3",` : ''}
    ${backendServiceChoice === 'Firebase' ? '"firebase": "^9.15.0",' : ''}
    ${stylingChoice === 'TailwindCSS' ? '"tailwindcss": "^3.3.2",' : ''}
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.14",
    "@types/react-dom": "^18.2.6",
    "@typescript-eslint/eslint-plugin": "^5.61.0",
    "@typescript-eslint/parser": "^5.61.0",
    "@vitejs/plugin-react": "^4.0.1",
    "eslint": "^8.44.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.1",
    "typescript": "^5.0.2",
    "vite": "^4.4.0"
    ${stylingChoice === 'TailwindCSS' ? ',"autoprefixer": "^10.4.14","postcss": "^8.4.25","tailwindcss": "^3.3.2"' : ''}
  }
}
`;
  fs.writeFileSync(path.join(rootDir, 'package.json'), packageJsonContent);

  const viteConfigContent = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`;

  fs.writeFileSync(path.join(rootDir, 'vite.config.ts'), viteConfigContent);

  const tsconfigContent = `
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`;

  fs.writeFileSync(path.join(rootDir, 'tsconfig.json'), tsconfigContent);

  const tsconfigNodeContent = `
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
`;

  fs.writeFileSync(path.join(rootDir, 'tsconfig.node.json'), tsconfigNodeContent);

  const eslintrcContent = `
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
`;

  fs.writeFileSync(path.join(rootDir, '.eslintrc.cjs'), eslintrcContent);

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

yarn-debug.log*
yarn-error.log*
`;
  fs.writeFileSync(path.join(rootDir, '.gitignore'), gitignoreContent);

  const readmeContent = `
# ${frameworkChoice} Boilerplate

This project was bootstrapped with a custom ${frameworkChoice} boilerplate.

## Available Scripts

In the project directory, you can run:

### \`yarn dev\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### \`yarn build\`

Builds the app for production to the \`build\` folder.

### \`yarn start\`

Runs the app in production mode.

### \`yarn lint\`

Lints the project files using ESLint.

### \`yarn format\`

Formats the project files using Prettier.
`;
  fs.writeFileSync(path.join(rootDir, 'README.md'), readmeContent);

  const envContent = `
REACT_APP_API_URL=http://localhost:3000/api
`;
  fs.writeFileSync(path.join(rootDir, '.env'), envContent);

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

    // Remove the creation of index.tsx

    const appTsxContent = `
import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React</h1>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
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

  // Commented out for future use
  // if (frameworkChoice === 'Next.js') {
  //   const indexTsxContent = `
  //   import React from 'react';
  //
  //   export default function Home() {
  //     return (
  //       <div>
  //         <h1>Welcome to Next.js with TypeScript</h1>
  //       </div>
  //     );
  //   }
  //   `;
  //   fs.writeFileSync(path.join(rootDir, 'pages', 'index.tsx'), indexTsxContent);
  //
  //   const appTsxContent = `
  //   import '../styles/globals.css';
  //   import type { AppProps } from 'next/app';
  //
  //   function MyApp({ Component, pageProps }: AppProps) {
  //     return <Component {...pageProps} />;
  //   }
  //
  //   export default MyApp;
  //   `;
  //   fs.writeFileSync(path.join(rootDir, 'pages', '_app.tsx'), appTsxContent);
  //
  //   const documentTsxContent = `
  //   import Document, { Html, Head, Main, NextScript } from 'next/document';
  //
  //   class MyDocument extends Document {
  //     render() {
  //       return (
  //         <Html>
  //           <Head />
  //           <body>
  //             <Main />
  //             <NextScript />
  //           </body>
  //         </Html>
  //       );
  //     }
  //   }
  //
  //   export default MyDocument;
  //   `;
  //   fs.writeFileSync(path.join(rootDir, 'pages', '_document.tsx'), documentTsxContent);
  //
  //   const apiHelloTsContent = `
  //   import type { NextApiRequest, NextApiResponse } from 'next';
  //
  //   type Data = {
  //     name: string;
  //   };
  //
  //   export default function handler(
  //     req: NextApiRequest,
  //     res: NextApiResponse<Data>
  //   ) {
  //     res.status(200).json({ name: 'John Doe' });
  //   }
  //   `;
  //   fs.writeFileSync(path.join(rootDir, 'pages', 'api', 'hello.ts'), apiHelloTsContent);
  // }

  // After all files have been created
  const installDeps = await vscode.window.showQuickPick(['Yes', 'No'], {
    placeHolder: 'Do you want to install dependencies now?',
  });

  if (installDeps === 'Yes') {
    const installDependencies = async () => {
      return new Promise<void>((resolve, reject) => {
        const terminal = vscode.window.createTerminal('Dependency Installation');
        terminal.show();
        terminal.sendText('yarn install');

        // We can't directly know when the installation is complete in the terminal,
        // so we'll resolve the promise immediately and let the user see the progress in the terminal
        resolve();
      });
    };

    try {
      await installDependencies();
      vscode.window.showInformationMessage(`Dependencies installation started in the terminal. Please wait for it to complete.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to start dependency installation: ${errorMessage}`);
    }
  } else {
    vscode.window.showInformationMessage(`Boilerplate created successfully. Run 'yarn install' in the project directory to install dependencies.`);
  }

  if (stylingChoice === 'TailwindCSS') {
    if (installDeps === 'Yes') {
      const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Tailwind Installation');
      terminal.show();
      terminal.sendText(`yarn add -D tailwindcss@latest postcss@latest autoprefixer@latest`);
    }

    // Generate Tailwind config file
    const tailwindConfigContent = `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    fs.writeFileSync(path.join(rootDir, 'tailwind.config.js'), tailwindConfigContent);

    // Create PostCSS config file
    const postcssConfigContent = `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    fs.writeFileSync(path.join(rootDir, 'postcss.config.js'), postcssConfigContent);

    // Update index.css with Tailwind directives
    const indexCssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'index.css'), indexCssContent);

    // Update App.tsx with a Tailwind example
    const appTsxContent = `
import React from 'react';

function App() {
  return (
    <div className="text-center">
      <header className="bg-gray-800 min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to React with Tailwind CSS</h1>
        <p className="text-xl">
          Edit <code className="bg-gray-700 px-1 rounded">src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'App.tsx'), appTsxContent);

    vscode.window.showInformationMessage('Tailwind CSS has been set up successfully!');
  }

  if (stateManagementChoice === 'Redux' && languageChoice === 'TypeScript') {
    // Create Redux directory structure
    const reduxDirs = ['src/redux', 'src/redux/slices', 'src/redux/hooks'];
    createDirs(reduxDirs);

    // Create store.ts
    const storeContent = `
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'redux', 'store.ts'), storeContent);

    // Create counterSlice.ts
    const counterSliceContent = `
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'redux', 'slices', 'counterSlice.ts'), counterSliceContent);

    // Create hooks.ts
    const hooksContent = `
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'redux', 'hooks', 'hooks.ts'), hooksContent);

    // Create Counter component with Tailwind CSS styles
    const counterComponentContent = `
import React from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks/hooks';
import { decrement, increment } from '../redux/slices/counterSlice';

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">Counter</h2>
        <div className="flex items-center justify-center space-x-4">
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition-colors duration-300"
            aria-label="Decrement value"
            onClick={() => dispatch(decrement())}
          >
            -
          </button>
          <span className="text-5xl font-bold text-gray-700">{count}</span>
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition-colors duration-300"
            aria-label="Increment value"
            onClick={() => dispatch(increment())}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default Counter;
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'components', 'Counter.tsx'), counterComponentContent);

    // Update App.tsx to use the styled Counter
    const appTsxContent = `
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Counter from './components/Counter';

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

export default App;
`;
    fs.writeFileSync(path.join(rootDir, 'src', 'App.tsx'), appTsxContent);
  }

  if (backendServiceChoice === 'Firebase') {
    // Create utils directory if it doesn't exist
    const utilsDir = path.join(rootDir, 'src', 'utils');
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }

    // Create firebaseConfig.js with placeholder text
    const firebaseConfigContent = `
import { initializeApp } from "firebase/app";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
`;
    fs.writeFileSync(path.join(utilsDir, 'firebaseConfig.js'), firebaseConfigContent);

    vscode.window.showInformationMessage('Firebase configuration file created in src/utils/firebaseConfig.js');
  }

  // Create main.tsx for Vite (this is the only entry point we need)
  const mainTsxContent = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
${stateManagementChoice === 'Redux' ? "import { Provider } from 'react-redux'\nimport { store } from './redux/store'" : ''}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    ${stateManagementChoice === 'Redux' ? '<Provider store={store}>' : ''}
    <App />
    ${stateManagementChoice === 'Redux' ? '</Provider>' : ''}
  </React.StrictMode>,
)
`;
  fs.writeFileSync(path.join(rootDir, 'src', 'main.tsx'), mainTsxContent);

  // Create index.html for Vite (update the script src to main.tsx)
  const indexHtmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(rootDir, 'index.html'), indexHtmlContent);

  vscode.window.showInformationMessage('React boilerplate created successfully!');
};
