import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { generateReactBoilerplate } from './commands/generateReactBoilerplate';

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    const startProjectSetup = vscode.commands.registerCommand('extension.startProjectSetup', async () => {
        // For now, we'll only use Web (React) option
        const projectType = 'Web (React)';
        
        // Commented out for future use
        // const projectType = 'Web (React/Next)';

        // Commented out for future use
        /*
        const projectType = await vscode.window.showQuickPick(
            ['Web (React)', 'Web (React/Next)', 'Mobile (React-Native)', 'Backend (Node/Express)'],
            { placeHolder: 'Select your project type' }
        );

        if (!projectType) { return; }
        */

        switch (projectType) {
            case 'Web (React)':
                await setupWebProject();
                break;
            // Commented out for future use
            /*
            case 'Web (React/Next)':
                await setupWebProject(true);
                break;
            case 'Mobile (React-Native)':
                await setupMobileProject();
                break;
            case 'Backend (Node/Express)':
                await setupBackendProject();
                break;
            default:
                vscode.window.showErrorMessage('Invalid project type selected');
            */
        }
    });

    context.subscriptions.push(startProjectSetup);
}

// Function to set up a Web project (React)
async function setupWebProject(isNext: boolean = false) {
    await generateReactBoilerplate();
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
    } else {
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
    } else {
        vscode.window.showErrorMessage('Missing required options for Backend project');
    }
}

// Generate Mobile project files and directories
function generateMobileBoilerplate(language: string, stateManagement: string) {
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
function generateBackendBoilerplate(apiType: string, database: string) {
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
function createDirectories(dirs: string[]) {
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// This method is called when the extension is deactivated
export function deactivate() { }
