# myTo-DoApp
**myTo-DoApp** is a basic task management application that helps you organize your daily activities in a simple and intuitive way. Built with Ionic and Angular, it provides a user-friendly interface to easily create, track, and complete your to-do list. The app is designed for both iOS and Android, leveraging cross-platform capabilities.

### Features of myTo-DoApp
- **Task Management:** Create, edit, mark as completed, and delete tasks seamlessly.
- **Cloud Synchronization:** Integrates with Firebase to securely store your tasks and access them from anywhere.
- **Cross-platform:** Developed using Ionic, ensuring a smooth experience on both Android and iOS devices.
- **Hardware Access:** Utilizes the device's native hardware through Capacitor for an enhanced user experience.
- **Data Storage:** Implements local storage with SQLite for efficient data management.

### Built With
This application was developed using the knowledge and tools covered in:
- **Programming Languages and Frameworks for Mobile Web Apps** - [6 hours] (Reference: Bibliography 2).
  - Features and alternatives for cross-platform app development.
  - **Ionic:** A framework for developing iOS and Android apps.
  - **SQLite:** For database storage within the app.
  - Access to mobile device hardware for a more interactive user experience.

### Project Structure and Files

Here’s a breakdown of the main directories and files included in this project:

#### Directories
- **`.vscode/`**: Contains Visual Studio Code configurations specific to this project, such as recommended extensions and environment settings.
- **`android/`**: Auto-generated by Capacitor, this folder includes the Android-specific files and resources needed to build and configure the app on the Android platform. This directory must be opened and built in **Android Studio**.
- **`src/`**: The main source code directory. It contains the Angular components, services, styles, and other files that define the app's functionality and user interface.

#### Configuration Files
- **`.browserslistrc`**: Specifies the browsers supported by the application, aiding in the optimization and transpilation of code.
- **`.editorconfig`**: Ensures consistent coding styles such as indentation and file encoding throughout the project.
- **`.eslintrc.json`**: Configuration file for ESLint, which defines coding standards and rules to maintain code quality.
- **`.firebaserc`**: Configures the Firebase project environments for the app.
- **`.gitignore`**: Lists the files and directories that Git should ignore, preventing sensitive or unnecessary data from being included in version control.

#### Key Project Files
- **`angular.json`**: Defines settings for the Angular CLI, such as build options, file structure, and application-specific configurations.
- **`capacitor.config.ts`**: Configuration file for Capacitor, specifying settings for building the app on Android and iOS platforms.
- **`firebase.json`**: Configures Firebase services like authentication and database integration.
- **`ionic.config.json`**: Provides configurations for the Ionic CLI, detailing information about the app and the available Ionic commands.
- **`karma.conf.js`**: Sets up Karma for running unit tests within the Angular environment.
- **`package.json`**: Lists the project's dependencies and scripts needed to build, test, and run the application.
- **`package-lock.json`**: Automatically generated to lock the versions of the installed dependencies, ensuring consistency across different environments.
- **`tsconfig.app.json`**: TypeScript configuration specific to the main application, defining modules, aliases, and compilation options.
- **`tsconfig.json`**: The root TypeScript configuration file for the entire project, containing global settings.
- **`tsconfig.spec.json`**: TypeScript settings for test files, optimizing for unit testing in Angular.
- **`webpack.config.js`**: Custom Webpack configuration used for the application’s build process.

### Installation and Setup
To get started with **myTo-DoApp**, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <REPOSITORY_URL>
   cd MyTODOapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the app in development mode:**
   ```bash
   ionic serve
   ```

4. **Build the app for Android:**
   - Open the `android/` directory in **Android Studio**.
   - Use Android Studio to build and run the application on an Android device or emulator.

5. **Run unit tests:**
   ```bash
   npm run test
   ```

### Contribution
Contributions are welcome! Please create a new branch, make your changes, and open a pull request. Make sure to adhere to the coding standards outlined in `.editorconfig` and `.eslintrc.json`.
