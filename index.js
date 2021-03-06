const customUtils = require('./utils');
const os = require('os');
const fs = require('fs');
const path = require('path');
const nodeUtils = require('util');
const exec = nodeUtils.promisify(require('child_process').exec);

const isRunningOnWindows = (os.platform() === 'win32');

const gradleFileNames = {
    wrapperName: {
        patterns: {
            windows: RegExp('gradlew\\.bat$', 'i'),
            nix: RegExp('gradlew$')
        },
        names: {
            windows: 'gradlew.bat',
            nix: 'gradlew'
        }
    }
};

const ignorePatterns = [
    RegExp('\\.git$', 'i'),
    RegExp('\\.idea$', 'i'),
    RegExp('node_modules$', 'i')
];

const getFilesAndSubDirectories = (directory) => {
    const partitionedFiles = customUtils.partition(fs.readdirSync(directory), file => {
        try {
            return fs.statSync(path.join(directory, file)).isDirectory();
        } catch (e) {
            return false;
        }
    });

    const directories = partitionedFiles.filterPassed;
    const files = partitionedFiles.filterFailed;

    return {
        fileNames: files,
        directoryNames: directories
    };
};

const isThisAGradleProjectDirectory = (directory) => {
    const files = getFilesAndSubDirectories(directory).fileNames;

    if (isRunningOnWindows) {
        return (files.filter(fileName => gradleFileNames.wrapperName.patterns.windows.test(fileName)).length > 0)
    } else {
        return (files.filter(fileName => gradleFileNames.wrapperName.patterns.nix.test(fileName)).length > 0)
    }
};

const shouldIgnoreDirectory = (directory) => {
    for (const pattern of ignorePatterns) {
        if (pattern.test(directory)) {
            return true;
        }
    }

    return false;
};

const traverseDirectory = (directory) => {
    if (isThisAGradleProjectDirectory(directory)) {
        return [directory];
    } else if (shouldIgnoreDirectory(directory)) {
        return [];
    } else {
        const gradleProjectDirectories = [];

        getFilesAndSubDirectories(directory).directoryNames
            .map(name => path.join(directory, name))
            .forEach(subDirectory => {
                traverseDirectory(subDirectory).forEach(s => gradleProjectDirectories.push(s))
            });

        return gradleProjectDirectories;
    }
};

const getCleanCommandFromProjectDirectory = (gradleProjectDirectory) => {
    let wrapperFileName;
    if (isRunningOnWindows) {
        wrapperFileName = path.join(gradleProjectDirectory, gradleFileNames.wrapperName.names.windows);
    } else {
        wrapperFileName = path.join(gradleProjectDirectory, gradleFileNames.wrapperName.names.nix);
    }

    return {
        workingDirectory: gradleProjectDirectory,
        command: `\"${wrapperFileName}\" clean`
    };
};

const executeIndividualProjectCleanCommand = async (projectCleanCommand) => {
    const {stdout, stderr} = await exec(
        projectCleanCommand.command,
        {cwd: projectCleanCommand.workingDirectory}
    );
    console.log(stdout);
    console.error(stderr);
};

const executeGradleCleanCommands = async (gradleCleanCommands) => {
    // Run each gradle clean command and await for each command
    let command;
    for (command of gradleCleanCommands) {
        await executeIndividualProjectCleanCommand(command);
    }
};

const main = async () => {
    let baseDirectory;
    if (process.argv.length > 2) {
        baseDirectory = process.argv[2];
    } else {
        baseDirectory = process.cwd();
    }

    if (fs.existsSync(baseDirectory)) {
        const gradleProjectCleanCommands = traverseDirectory(baseDirectory)
            .map(projectDirectory => getCleanCommandFromProjectDirectory(projectDirectory));

        console.log(`${gradleProjectCleanCommands.length} projects found to be cleaned`);

        await executeGradleCleanCommands(gradleProjectCleanCommands);
    } else {
        console.error("The specified file/directory does not exist. Please provide either a valid directory or execute this script from the target directory.")
    }
};

const globalGradleClean = () => {
    main()
        .catch(error => {
            console.error(error);
            process.exit(1);
        })
};

module.exports = globalGradleClean;
