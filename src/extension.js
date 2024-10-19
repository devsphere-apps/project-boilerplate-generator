"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// This method is called when the extension is activated
function activate(context) {
    const startProjectSetup = vscode.commands.registerCommand('extension.startProjectSetup', async () => {
        const projectType = await vscode.window.showQuickPick(['Web (React/Next)', 'Mobile (React-Native)', 'Backend (Node/Express)'], { placeHolder: 'Select your project type' });
        if (!projectType) {
            return;
        }
        if (projectType === 'Web (React/Next)') {
            const languageChoice = await vscode.window.showQuickPick(['TypeScript', 'JavaScript'], {
                placeHolder: 'Choose your language'
            });
            const stateManagement = await vscode.window.showQuickPick(['ContextAPI', 'Redux', 'MobX'], {
                placeHolder: 'Select State Management'
            });
            const authentication = await vscode.window.showQuickPick(['NextAuth.js', 'Firestore Auth'], {
                placeHolder: 'Select Authentication'
            });
            if (languageChoice && stateManagement && authentication) {
                generateWebBoilerplate(languageChoice, stateManagement, authentication);
            }
            else {
                vscode.window.showErrorMessage('Missing required options for Web project');
            }
        }
        else if (projectType === 'Mobile (React-Native)') {
            const languageChoice = await vscode.window.showQuickPick(['TypeScript', 'JavaScript'], {
                placeHolder: 'Choose your language'
            });
            const stateManagement = await vscode.window.showQuickPick(['ContextAPI', 'Redux', 'MobX'], {
                placeHolder: 'Select State Management'
            });
            if (languageChoice && stateManagement) {
                generateMobileBoilerplate(languageChoice, stateManagement);
            }
            else {
                vscode.window.showErrorMessage('Missing required options for Mobile project');
            }
        }
        else if (projectType === 'Backend (Node/Express)') {
            const apiChoice = await vscode.window.showQuickPick(['REST', 'GraphQL'], {
                placeHolder: 'Choose your API type'
            });
            const databaseChoice = await vscode.window.showQuickPick(['Postgres', 'MongoDB', 'Firestore'], {
                placeHolder: 'Choose your database'
            });
            if (apiChoice && databaseChoice) {
                generateBackendBoilerplate(apiChoice, databaseChoice);
            }
            else {
                vscode.window.showErrorMessage('Missing required options for Backend project');
            }
        }
    });
    context.subscriptions.push(startProjectSetup);
}
// Function to set up a Web project (React/Next.js)
async function setupWebProject() {
    const languageChoice = await vscode.window.showQuickPick(['TypeScript', 'JavaScript'], {
        placeHolder: 'Choose your language'
    });
    const stateManagement = await vscode.window.showQuickPick(['ContextAPI', 'Redux', 'MobX'], {
        placeHolder: 'Select State Management'
    });
    const authentication = await vscode.window.showQuickPick(['NextAuth.js', 'Firestore Auth'], {
        placeHolder: 'Select Authentication'
    });
    if (languageChoice && stateManagement && authentication) {
        vscode.window.showInformationMessage(`Setting up ${languageChoice} project with ${stateManagement} and ${authentication}`);
        generateWebBoilerplate(languageChoice, stateManagement, authentication);
    }
    else {
        vscode.window.showErrorMessage('Missing required options for Web project');
    }
}
// Function to set up a Mobile project (React-Native)
async function setupMobileProject() {
    const languageChoice = await vscode.window.showQuickPick(['TypeScript', 'JavaScript'], {
        placeHolder: 'Choose your language'
    });
    const stateManagement = await vscode.window.showQuickPick(['ContextAPI', 'Redux', 'MobX'], {
        placeHolder: 'Select State Management'
    });
    if (languageChoice && stateManagement) {
        vscode.window.showInformationMessage(`Setting up ${languageChoice} mobile project with ${stateManagement}`);
        generateMobileBoilerplate(languageChoice, stateManagement);
    }
    else {
        vscode.window.showErrorMessage('Missing required options for Mobile project');
    }
}
// Function to set up a Backend project (Node.js + Express)
async function setupBackendProject() {
    const apiChoice = await vscode.window.showQuickPick(['REST', 'GraphQL'], {
        placeHolder: 'Choose your API type'
    });
    const databaseChoice = await vscode.window.showQuickPick(['Postgres', 'MongoDB', 'Firestore'], {
        placeHolder: 'Choose your database'
    });
    if (apiChoice && databaseChoice) {
        vscode.window.showInformationMessage(`Setting up ${apiChoice} API with ${databaseChoice} database`);
        generateBackendBoilerplate(apiChoice, databaseChoice);
    }
    else {
        vscode.window.showErrorMessage('Missing required options for Backend project');
    }
}
// Generate Web project files and directories
function generateWebBoilerplate(language, stateManagement, authentication) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
    }
    const projectPath = workspaceFolders[0].uri.fsPath;
    const srcPath = path.join(projectPath, 'src');
    const pagesPath = path.join(srcPath, 'pages');
    const componentsPath = path.join(srcPath, 'components');
    // Create necessary directories
    createDirectories([srcPath, pagesPath, componentsPath]);
    // Create `index.tsx` file
    const indexContent = `import React from 'react';

export default function HomePage() {
    return <div>Welcome to your ${language} Next.js project!</div>;
}`;
    fs.writeFileSync(path.join(pagesPath, 'index.tsx'), indexContent);
    // Create `Navbar.tsx` file
    const navbarContent = `import React from 'react';

export default function Navbar() {
    return <nav>Navbar for ${stateManagement} state management with ${authentication} authentication</nav>;
}`;
    fs.writeFileSync(path.join(componentsPath, 'Navbar.tsx'), navbarContent);
    vscode.window.showInformationMessage('Boilerplate files for Web project generated successfully!');
}
// Generate Mobile project files and directories
function generateMobileBoilerplate(language, stateManagement) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
    }
    const projectPath = workspaceFolders[0].uri.fsPath;
    const srcPath = path.join(projectPath, 'src');
    const screensPath = path.join(srcPath, 'screens');
    const componentsPath = path.join(srcPath, 'components');
    // Create necessary directories
    createDirectories([srcPath, screensPath, componentsPath]);
    // Create `Home.tsx` file
    const homeContent = `import React from 'react';
import { View, Text } from 'react-native';

export default function Home() {
    return (
        <View>
            <Text>Welcome to your ${language} React-Native project!</Text>
        </View>
    );
}`;
    fs.writeFileSync(path.join(screensPath, 'Home.tsx'), homeContent);
    vscode.window.showInformationMessage('Boilerplate files for Mobile project generated successfully!');
}
// Generate Backend project files and directories
function generateBackendBoilerplate(apiType, database) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
    }
    const projectPath = workspaceFolders[0].uri.fsPath;
    const srcPath = path.join(projectPath, 'src');
    const routesPath = path.join(srcPath, 'routes');
    // Create necessary directories
    createDirectories([srcPath, routesPath]);
    // Generate `api.ts` or `graphql.ts`
    const apiContent = apiType === 'REST' ? `
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to your REST API');
});

export default router;
` : `
import { ApolloServer, gql } from 'apollo-server-express';

const typeDefs = gql\`
    type Query {
        message: String
    }
\`;

const resolvers = {
    Query: {
        message: () => 'Welcome to your GraphQL API'
    }
};

export const server = new ApolloServer({ typeDefs, resolvers });
`;
    const apiFileName = apiType === 'REST' ? 'api.ts' : 'graphql.ts';
    fs.writeFileSync(path.join(routesPath, apiFileName), apiContent);
    vscode.window.showInformationMessage('Boilerplate files for Backend project generated successfully!');
}
// Utility function to create directories
function createDirectories(dirs) {
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}
// This method is called when the extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map